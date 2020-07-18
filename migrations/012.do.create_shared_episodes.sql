create table shared_episodes (
    uni_id uuid primary key DEFAULT uuid_generate_v4 () UNIQUE,
    id uuid references episodes(uni_id) ON DELETE CASCADE,
    episode_num text,
    show_title text,
    project_id uuid references projects(id) ON DELETE CASCADE,
    episode_title text,
    author text,
    logline text,
    genre text,
    projformat text,
    budget text,
    timeperiod text,
    similarepisodes text,
    framework text,
    bottle_episode text,
    visible boolean,
    show_hidden boolean,
    shared_by_uid text references users(uid) not null,
    shared_with_uid text references users(uid) not null,
    permission text,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 

)