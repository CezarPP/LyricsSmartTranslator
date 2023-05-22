------------------ COMMUNITY

CREATE OR REPLACE FUNCTION get_most_active_users(max_rows INT)
    RETURNS TABLE
            (
                user_id        INT,
                img_id         INT,
                username       VARCHAR,
                activity_count BIGINT
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT u.id                                          AS user_id,
               u.img_id                                      AS img_id,
               u.username                                    AS username,
               (COUNT(DISTINCT s.id) + COUNT(DISTINCT t.id)) AS activity_count
        FROM users u
                 LEFT JOIN songs s ON u.id = s.image_id
                 LEFT JOIN translations t ON u.id = t.user_id
        GROUP BY u.id
        ORDER BY activity_count DESC
        LIMIT max_rows;
END;
$$;

------------------ CHARTS

CREATE OR REPLACE FUNCTION get_newest_songs(max_rows INT)
    RETURNS TABLE
            (
                song_id        INT,
                artist         VARCHAR,
                title          VARCHAR,
                translation_id INT,
                "time"         TIMESTAMP
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.id                  AS song_id,
               s.artist              AS artist,
               s.title               AS title,
               s.primary_translation AS translation_id,
               t."time"
        FROM songs s
                 JOIN translations t ON s.primary_translation = t.id
        ORDER BY t."time" DESC
        LIMIT max_rows;
END;
$$
    LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_most_commented_songs(max_rows INT)
    RETURNS TABLE
            (
                song_id        INT,
                artist         VARCHAR,
                title          VARCHAR,
                translation_id INT,
                comment_count  INT
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.id        AS song_id,
               s.artist    AS artist,
               s.title     AS title,
               s.primary_translation AS translation_id,
               COUNT(c.id) AS comment_count
        FROM songs s
                 LEFT JOIN translations t ON s.primary_translation = t.id
                 LEFT JOIN comments c ON t.id = c.translation_id
        GROUP BY s.id
        ORDER BY comment_count DESC
        LIMIT max_rows;
END;
$$
    LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_most_viewed_songs(max_rows INT)
    RETURNS TABLE
            (
                song_id     INT,
                artist      VARCHAR,
                title       VARCHAR,
                translation_id INT,
                views_count INT
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.id            AS song_id,
               s.artist        AS artist,
               s.title         AS title,
               s.primary_translation AS translation_id,
               SUM(t.no_views) AS views_count
        FROM songs s
                 JOIN Translations t ON s.primary_translation = t.id
        GROUP BY s.id
        ORDER BY views_count DESC
        LIMIT max_rows;
END;
$$
    LANGUAGE plpgsql;