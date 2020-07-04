create table projects (
    id uuid primary key DEFAULT uuid_generate_v4 () UNIQUE,
    uid text references users(uid) not null,
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
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shared boolean

)

