create table users (
    id integer primary key generated by default as identity,
    uid text UNIQUE,
    user_name text,
    email text,
    photo_url text
)