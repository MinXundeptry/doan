# Admin and role API

This implementation uses the existing `users.role` column and does not require
additional role tables. On an existing database, run
`docs/migrations/20261007_add_user_active_status.sql` and
`docs/migrations/20261007_create_activity_logs.sql` and
`docs/migrations/20261007_add_profile_calorie_goal.sql` before starting this
version. The current role set is fixed to
`admin` and `user`, matching the existing MySQL enum. Role definitions and
permissions are configured in `backend-core/src/constants/roles.js`.

Users can view the shared food catalog, but only administrators receive the
`foods:manage` permission to add, update, or delete its standard nutrition
records. User calorie goals are calculated from TDEE with a 300 kcal
adjustment for gradual weight change and a 1200/1500 kcal lower bound by
profile gender.

Admin endpoints require a bearer token and the listed permission:

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/users?page=1&limit=20&search=&role_id=` | `users:read` | List/search users |
| GET | `/api/v1/admin/users/:id` | `users:read` | Get user details |
| GET | `/api/v1/admin/reports/summary` | `users:read` | User/food totals, 7-day food/activity totals, and in-process API performance metrics |
| PATCH | `/api/v1/admin/users/:id/role` | `users:assign-role` | Assign `{ "role": "admin" }` or `{ "role": "user" }` |
| PATCH | `/api/v1/admin/users/:id/status` | `users:assign-role` | Lock/unlock with `{ "is_active": false }` or `{ "is_active": true }` |
| POST | `/api/v1/activities` | `activities:create` | Record an activity type and duration |
| GET | `/api/v1/activities/daily?date=YYYY-MM-DD` | `activities:read` | Read own daily activity and estimated calories burned |
| DELETE | `/api/v1/activities/:id` | `activities:delete` | Delete an activity from own log |
| GET | `/api/v1/reports/weekly?end_date=YYYY-MM-DD` | `reports:read` | Get the caller's seven-day food and activity totals |
| GET | `/api/v1/reports/weekly?end_date=YYYY-MM-DD` | `reports:read` | Get the caller's seven-day food and activity totals |
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
request. Locked accounts cannot log in, and existing tokens are rejected on
their next API request. Administrators cannot lock themselves or the last
active administrator. User-list pagination defaults to page 1 and limit 20;
limit must be between 1 and 100.
