using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure;

public static class WebPushCrypto
{
    public static (string PublicKey, string PrivateKey) GenerateVapidKeys()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var parameters = key.ExportParameters(true);
        return (EncodePoint(parameters.Q), WebEncoders.Base64UrlEncode(parameters.D!));
    }

    public static HttpRequestMessage CreateRequest(string endpoint, string p256dh, string auth, string payload, string subject, string publicKey, string privateKey)
    {
        var destination = new Uri(endpoint);
        var audience = destination.GetLeftPart(UriPartial.Authority);
        var expiration = DateTimeOffset.UtcNow.AddHours(12).ToUnixTimeSeconds();
        var header = WebEncoders.Base64UrlEncode("{\"typ\":\"JWT\",\"alg\":\"ES256\"}"u8.ToArray());
        var claims = WebEncoders.Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(new { aud = audience, exp = expiration, sub = subject }));
        var token = $"{header}.{claims}";
        var applicationPoint = DecodePoint(publicKey);
        using var signer = ECDsa.Create(new ECParameters { Curve = ECCurve.NamedCurves.nistP256, D = WebEncoders.Base64UrlDecode(privateKey), Q = applicationPoint });
        var signature = signer.SignData(Encoding.ASCII.GetBytes(token), HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

        var content = Encrypt(payload, p256dh, auth);
        var request = new HttpRequestMessage(HttpMethod.Post, destination) { Content = new ByteArrayContent(content) };
        request.Content.Headers.ContentType = new("application/octet-stream");
        request.Content.Headers.ContentEncoding.Add("aes128gcm");
        request.Headers.Authorization = new AuthenticationHeaderValue("vapid", $"t={token}.{WebEncoders.Base64UrlEncode(signature)}, k={publicKey}");
        request.Headers.TryAddWithoutValidation("TTL", "2419200");
        return request;
    }

    private static byte[] Encrypt(string payload, string p256dh, string auth)
    {
        var receiverPoint = DecodePoint(p256dh);
        using var receiver = ECDiffieHellman.Create(new ECParameters { Curve = ECCurve.NamedCurves.nistP256, Q = receiverPoint });
        using var sender = ECDiffieHellman.Create(ECCurve.NamedCurves.nistP256);
        var senderPoint = sender.ExportParameters(false).Q;
        var senderPublic = PointBytes(senderPoint);
        var receiverPublic = PointBytes(receiverPoint);
        var secret = sender.DeriveRawSecretAgreement(receiver.PublicKey);
        var authSecret = WebEncoders.Base64UrlDecode(auth);
        var keyInfo = Concat("WebPush: info\0"u8.ToArray(), receiverPublic, senderPublic);
        var ikm = Hkdf(secret, authSecret, keyInfo, 32);
        var salt = RandomNumberGenerator.GetBytes(16);
        var key = Hkdf(ikm, salt, "Content-Encoding: aes128gcm\0"u8.ToArray(), 16);
        var nonce = Hkdf(ikm, salt, "Content-Encoding: nonce\0"u8.ToArray(), 12);
        var plaintext = Concat(Encoding.UTF8.GetBytes(payload), [2]);
        var ciphertext = new byte[plaintext.Length];
        var tag = new byte[16];
        using (var aes = new AesGcm(key, tag.Length)) aes.Encrypt(nonce, plaintext, ciphertext, tag);

        var body = new byte[16 + 4 + 1 + senderPublic.Length + ciphertext.Length + tag.Length];
        salt.CopyTo(body, 0);
        System.Buffers.Binary.BinaryPrimitives.WriteUInt32BigEndian(body.AsSpan(16, 4), 4096);
        body[20] = (byte)senderPublic.Length;
        senderPublic.CopyTo(body, 21);
        ciphertext.CopyTo(body, 21 + senderPublic.Length);
        tag.CopyTo(body, 21 + senderPublic.Length + ciphertext.Length);
        return body;
    }

    private static byte[] Hkdf(byte[] input, byte[] salt, byte[] info, int length)
    {
        var output = new byte[length];
        HKDF.DeriveKey(HashAlgorithmName.SHA256, input, output, salt, info);
        return output;
    }

    private static ECPoint DecodePoint(string encoded)
    {
        var point = WebEncoders.Base64UrlDecode(encoded);
        if (point.Length != 65 || point[0] != 4) throw new CryptographicException("Invalid P-256 public key.");
        return new() { X = point[1..33], Y = point[33..65] };
    }

    private static string EncodePoint(ECPoint point) => WebEncoders.Base64UrlEncode(PointBytes(point));
    private static byte[] PointBytes(ECPoint point) => [4, .. point.X!, .. point.Y!];
    private static byte[] Concat(params byte[][] values)
    {
        var result = new byte[values.Sum(x => x.Length)];
        var offset = 0;
        foreach (var value in values) { value.CopyTo(result, offset); offset += value.Length; }
        return result;
    }
}
