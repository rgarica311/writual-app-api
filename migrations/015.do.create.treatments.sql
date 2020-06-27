create table treatments (
    id int primary key generated always as identity, 
    proj_name text,
    project_id uuid references projects(id) ON DELETE CASCADE,
    treatment jsonb,
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shared text[]
)