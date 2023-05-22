CREATE OR REPLACE FUNCTION get_most_active_users(max_rows INT)
    RETURNS TABLE
            (
                user_id        INT,
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
        FROM Users u
                 LEFT JOIN Songs s ON u.id = s.image_id
                 LEFT JOIN Translations t ON u.id = t.user_id
        GROUP BY u.id
        ORDER BY activity_count DESC
        LIMIT max_rows;
END;
$$;