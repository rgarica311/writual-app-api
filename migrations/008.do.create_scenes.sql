create table scenes (
	id uuid primary key DEFAULT uuid_generate_v4 () UNIQUE,
    user_id text references users(user_id) not null,
    project_name text,
    act text, 
    scene_heading text,
    thesis text,
    antithesis text,
    synthesis text
)