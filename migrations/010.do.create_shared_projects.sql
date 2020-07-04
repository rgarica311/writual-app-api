create table SharedProjects (
    uni_id uuid primary key DEFAULT uuid_generate_v4 () UNIQUE,
    id uuid references projects(id) ON DELETE CASCADE,
    title text, 
    author text,
    logline text,
    genre text,
    projformat text,
    has_episodes boolean,
    budget text,
    timeperiod text,
    similarprojects text,
    framework text,
    visible boolean,
    show_hidden boolean,
    shared_by_uid text references users(uid) not null,
    shared_with_uid text references users(uid) not null,
    permission text
)