# Permission System

## Roles
- **ADMIN**: Absolute access. Can manage users, taxonomy, and system settings.
- **EDITOR**: Can publish, edit, and approve articles across all reporters.
- **REPORTER**: Restricted to drafting and submitting their own assigned articles.

Role checks are performed at both the Middleware edge and internally within API Route handlers.