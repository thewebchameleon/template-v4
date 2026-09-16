using System.Buffers.Binary;
using System.IO.Compression;

namespace TemplateV4.Infrastructure.Images;

internal static class PngImage
{
    public static bool TryNormalize(ReadOnlySpan<byte> content, int maximumDimension, int maximumBytes, out byte[]? png)
    {
        png = null;
        if (content.Length is < 57 || content.Length > maximumBytes ||
            !content[..8].SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return false;
        using var clean = new MemoryStream(); clean.Write(content[..8]);
        using var compressed = new MemoryStream();
        var offset = 8; var hasHeader = false; var hasData = false; var stride = 0; var rows = 0;
        while (offset <= content.Length - 12)
        {
            var length = BinaryPrimitives.ReadUInt32BigEndian(content.Slice(offset, 4));
            if (length > content.Length - offset - 12) return false;
            var chunk = content.Slice(offset, (int)length + 12);
            var type = chunk.Slice(4, 4);
            if (Crc(chunk.Slice(4, (int)length + 4)) != BinaryPrimitives.ReadUInt32BigEndian(chunk[^4..])) return false;
            if (!hasHeader)
            {
                if (!type.SequenceEqual("IHDR"u8) || length != 13) return false;
                var width = BinaryPrimitives.ReadUInt32BigEndian(chunk.Slice(8, 4));
                var height = BinaryPrimitives.ReadUInt32BigEndian(chunk.Slice(12, 4));
                if (width is < 1 || width > maximumDimension || height is < 1 || height > maximumDimension ||
                    chunk[16] != 8 || chunk[17] is not (0 or 2 or 4 or 6) || chunk[18] != 0 || chunk[19] != 0 || chunk[20] != 0) return false;
                stride = checked((int)width * (chunk[17] switch { 0 => 1, 2 => 3, 4 => 2, _ => 4 }) + 1);
                rows = (int)height; hasHeader = true; clean.Write(chunk);
            }
            else if (type.SequenceEqual("IDAT"u8)) { hasData = true; clean.Write(chunk); compressed.Write(chunk.Slice(8, (int)length)); }
            else if (type.SequenceEqual("IEND"u8))
            {
                if (!hasData || length != 0 || offset + 12 != content.Length) return false;
                compressed.Position = 0;
                try
                {
                    using var inflater = new ZLibStream(compressed, CompressionMode.Decompress);
                    var row = new byte[stride];
                    for (var index = 0; index < rows; index++)
                    {
                        inflater.ReadExactly(row);
                        if (row[0] > 4) return false;
                    }
                    if (inflater.ReadByte() != -1) return false;
                }
                catch (Exception error) when (error is IOException or InvalidDataException) { return false; }
                clean.Write(chunk); png = clean.ToArray(); return true;
            }
            else if ((type[0] & 32) == 0) return false;
            offset += chunk.Length;
        }
        return false;
    }

    public static bool TryNormalize(string encoded, int maximumDimension, int maximumBytes, out byte[]? png)
    {
        png = null;
        if (encoded.Length > maximumBytes * 4 / 3 + 8) return false;
        try { return TryNormalize(Convert.FromBase64String(encoded), maximumDimension, maximumBytes, out png); }
        catch (FormatException) { return false; }
    }

    private static uint Crc(ReadOnlySpan<byte> value)
    {
        var crc = uint.MaxValue;
        foreach (var item in value)
        {
            crc ^= item;
            for (var bit = 0; bit < 8; bit++) crc = (crc >> 1) ^ ((crc & 1) == 0 ? 0 : 0xedb88320u);
        }
        return ~crc;
    }
}
