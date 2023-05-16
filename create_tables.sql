CREATE TABLE Users
(
    id       SERIAL PRIMARY KEY,
    img_id   INT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE Images
(
    id  SERIAL PRIMARY KEY,
    img BYTEA
);

ALTER TABLE Users
    ADD FOREIGN KEY (img_id)
        REFERENCES Images (id);

CREATE TABLE Songs
(
    id                  SERIAL PRIMARY KEY,
    primary_translation INT,
    image_id            INT,
    artist              VARCHAR(255),
    title               VARCHAR(255),
    link                TEXT
);

ALTER TABLE Songs
    ADD FOREIGN KEY (image_id)
        REFERENCES Images (id);

CREATE TABLE Translations
(
    id          SERIAL PRIMARY KEY,
    song_id     INT,
    user_id     INT,
    description TEXT,
    lyrics      TEXT,
    no_views    INT,
    no_likes    INT,
    time        TIMESTAMP
);

ALTER TABLE Translations
    ADD FOREIGN KEY (song_id)
        REFERENCES Songs (id);

ALTER TABLE Translations
    ADD FOREIGN KEY (user_id)
        REFERENCES Users (id);

ALTER TABLE Songs
    ADD FOREIGN KEY (primary_translation)
        REFERENCES Translations (id);

CREATE TABLE Annotations
(
    id             SERIAL PRIMARY KEY,
    user_id        INT,
    translation_id INT,
    begin_pos      INT,
    end_pos        INT,
    content        TEXT
);

ALTER TABLE Annotations
    ADD FOREIGN KEY (user_id)
        REFERENCES Users (id);

ALTER TABLE Annotations
    ADD FOREIGN KEY (translation_id)
        REFERENCES Translations (id);

CREATE TABLE Comments
(
    id             SERIAL PRIMARY KEY,
    user_id        INT,
    translation_id INT,
    content        TEXT
);

ALTER TABLE Comments
    ADD FOREIGN KEY (user_id)
        REFERENCES Users (id);

ALTER TABLE Comments
    ADD FOREIGN KEY (translation_id)
        REFERENCES Translations (id);

CREATE TABLE Updates (
                         id SERIAL PRIMARY KEY,
                         user_id INT,
                         translation_id INT,
                         begin_pos INT,
                         end_pos INT,
                         content TEXT
);

ALTER TABLE Updates
    ADD FOREIGN KEY (user_id)
        REFERENCES Users(id);

ALTER TABLE Updates
    ADD FOREIGN KEY (translation_id)
        REFERENCES Translations(id);
