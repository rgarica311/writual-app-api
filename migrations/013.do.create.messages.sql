create table messages (
    id int primary key GENERATED ALWAYS AS IDENTITY,
    sender_uid text references users(uid) not null,
    recipient_uid text references users(uid) not null, 
    message text, 
    proj text,
    project_id uuid references projects(id) ON DELETE CASCADE,
    socket_available boolean, 
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 

)