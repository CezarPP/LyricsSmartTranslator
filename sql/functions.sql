------------------ COMMUNITY

DROP FUNCTION get_most_active_users;

CREATE OR REPLACE FUNCTION get_most_active_users(max_rows INT)
    RETURNS TABLE
            (
                user_id        INT,
                img_id         INT,
                username       VARCHAR,
                activity_count BIGINT,
                email           VARCHAR
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT u.id                                                                          AS user_id,
               u.img_id                                                                      AS img_id,
               u.username                                                                    AS username,
               (COUNT(DISTINCT t.id) * 10 + COUNT(DISTINCT a.id) * 5 + COUNT(DISTINCT c.id)) AS activity_count,
               u.email                                                                       AS email
        FROM users u
                 LEFT JOIN translations t ON u.id = t.user_id
                 LEFT JOIN annotations a ON u.id = a.user_id
                 LEFT JOIN comments c ON u.id = c.user_id
        GROUP BY u.id
        ORDER BY activity_count DESC
        LIMIT max_rows;
END;
$$;

------------------ CHARTS

CREATE OR REPLACE FUNCTION get_newest_songs(max_rows INT)
    RETURNS SETOF Songs
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.*
        FROM songs s
                 JOIN translations t ON s.primary_translation = t.id
        ORDER BY t."time" DESC
        LIMIT max_rows;
END;
$$
    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_most_commented_songs(max_rows INT)
    RETURNS SETOF Songs
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.*
        FROM songs s
                 LEFT JOIN translations t ON s.primary_translation = t.id
                 LEFT JOIN comments c ON t.id = c.translation_id
        GROUP BY s.id
        ORDER BY COUNT(c.id) DESC
        LIMIT max_rows;
END;
$$
    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_most_viewed_songs(max_rows INT)
    RETURNS SETOF Songs
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.*
        FROM songs s
                 JOIN Translations t ON s.primary_translation = t.id
        GROUP BY s.id
        ORDER BY SUM(t.no_views) DESC
        LIMIT max_rows;
END;
$$
    LANGUAGE plpgsql;

