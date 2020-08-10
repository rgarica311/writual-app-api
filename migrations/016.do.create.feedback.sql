create table feedback (
    id int primary key generated always as identity, 
    reviewer text, 
    proj_name text,
    project_id uuid references projects(id) ON DELETE CASCADE,
    episode_id uuid references episodes(uni_id) ON DELETE CASCADE,
    feedback jsonb,
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shared text[]
)