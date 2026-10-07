# Admin and role API

This implementation uses the existing `users.role` column and does not require
additional database tables or a migration. The current role set is fixed to
`admin` and `user`, matching the existing MySQL enum. Role definitions and
permissions are configured in `backend-core/src/constants/roles.js`.

Admin endpoints require a bearer token and the listed permission:

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/users?page=1&limit=20&search=&role_id=` | `users:read` | List/search users |
| GET | `/api/v1/admin/users/:id` | `users:read` | Get user details |
| PATCH | `/api/v1/admin/users/:id/role` | `users:assign-role` | Assign `{ "role": "admin" }` or `{ "role": "user" }` |
| GET | `/api/v1/admin/roles` | `roles:read` | List configured roles and their permissions |
| GET | `/api/v1/admin/roles/:id` | `roles:read` | Get a configured role (`1` admin, `2` user) |
| GET | `/api/v1/admin/permissions` | `permissions:read` | List configured permissions |
| GET | `/api/v1/admin/permissions/:id` | `permissions:read` | Get a configured permission |

Role and permission definitions are read-only API data because the existing
`users.role` enum cannot store custom roles or permission assignments. To
change the permission sets, edit `ROLE_DEFINITIONS` and
`PERMISSION_DEFINITIONS` in `backend-core/src/constants/roles.js`. To add
database-managed roles and permission assignments, the database schema must
first be extended.

For clients using the earlier numeric role format, `{ "role_id": 1 }` still
assigns admin and `{ "role_id": 2 }` still assigns user. New clients should use
the role slug format.

Permission checks read the current `users.role` from the database on each
request. User-list pagination defaults to page 1 and limit 20; limit must be
between 1 and 100.
