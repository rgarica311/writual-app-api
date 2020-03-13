create table projects (
    id uuid primary key DEFAULT uuid_generate_v4 (),
    user_id text references users(user_id) not null,
    title text UNIQUE, 
    author text,
    logline text,
    genre text,
    projformat text,
    budget text,
    timeperiod text,
    similarprojects text
)

