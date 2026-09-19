# ADR 0023: Files-only runtime module administration

Status: Superseded by [ADR 0031](0031-declarative-capabilities.md),
[ADR 0035](0035-module-categories-and-client-configuration.md),
[ADR 0036](0036-module-administration-safety.md), and
[ADR 0051](0051-platform-core-and-file-library.md).

The original Files-only runtime switch and endpoint contracts are obsolete. Agents must
derive module availability from the current catalog and capability API, apply the safety
rules in ADR 0036, and treat storage as platform core under ADR 0051.
