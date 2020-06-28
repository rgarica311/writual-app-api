create table scenes (
	id uuid primary key DEFAULT uuid_generate_v4 () UNIQUE,
    uid text references users(uid) not null,
    project_name text,
    project_id uuid references projects(id) ON DELETE CASCADE,
    act text, 
    step_name text, 
    scene_heading text,
    thesis text,
    antithesis text,
    synthesis text,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shared text[]

)