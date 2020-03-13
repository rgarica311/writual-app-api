create table characters (
    id uuid primary key DEFAULT uuid_generate_v4 () UNIQUE,
    user_id text references users(user_id) not null,
    project_name text,
	name text not null,
    age text not null,
    gender text not null,
    details text[]
)