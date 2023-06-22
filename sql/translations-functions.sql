-- Count a user's translations
CREATE OR REPLACE FUNCTION count_user_translations(p_user_id INT)
    RETURNS INT AS
$$
DECLARE
    translation_count INT;
BEGIN
    SELECT COUNT(*)
    INTO translation_count
    FROM Translations
    WHERE user_id = p_user_id;

    RETURN translation_count;
END;
$$
    LANGUAGE plpgsql;


-- Get all translations of a user
CREATE OR REPLACE FUNCTION get_user_translations(p_username VARCHAR(255))
    RETURNS TABLE
            (
                id          INTEGER,
                song_id     INTEGER,
                language    VARCHAR(64),
                description TEXT,
                lyrics      TEXT,
                no_views    INTEGER,
                "time"      TIMESTAMP
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT t.id, t.song_id, t.language, t.description, t.lyrics, t.no_views, t."time"
        FROM Translations t
                 INNER JOIN Users u ON t.user_id = u.id
        WHERE u.username = p_username;
END;
$$ LANGUAGE plpgsql;
