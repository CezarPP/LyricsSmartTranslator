DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Annotations;
DROP TABLE IF EXISTS Translations;
DROP TABLE IF EXISTS Songs;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Images;

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
    language    VARCHAR(64),
    description TEXT,
    lyrics      TEXT,
    no_views    INT,
    time        TIMESTAMP
);

ALTER TABLE Translations
    ADD FOREIGN KEY (song_id)
        REFERENCES Songs (id) ON DELETE CASCADE;

ALTER TABLE Translations
    ADD FOREIGN KEY (user_id)
        REFERENCES Users (id);

ALTER TABLE Songs
    ADD FOREIGN KEY (primary_translation)
        REFERENCES Translations (id) ON DELETE CASCADE;

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

-- we should not keep images in db, will keep them in the cloud

ALTER TABLE images
    ADD COLUMN link TEXT,
    ADD COLUMN extension TEXT;

ALTER TABLE images
    DROP COLUMN img;

ALTER TABLE Annotations
    ADD COLUMN reviewed BOOLEAN NOT NULL DEFAULT FALSE;