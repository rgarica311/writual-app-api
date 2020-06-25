create table details (
    id int primary key generated always as identity, 
    proj_name text,
    project_id uuid references projects(id) ON DELETE CASCADE,
    character_name text not null, 
    bio jsonb,
    want jsonb,
    need jsonb,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shared text[]
)