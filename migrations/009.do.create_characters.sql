create table characters (
    id uuid primary key DEFAULT uuid_generate_v4 () UNIQUE,
    uid text references users(uid) not null,
    project_name text,
    project_id uuid references projects(id) ON DELETE CASCADE,
	name text not null,
    age text not null,
    gender text not null,
    details text[],
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shared text[]

)