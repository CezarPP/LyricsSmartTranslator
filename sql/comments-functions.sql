CREATE
    OR REPLACE FUNCTION count_user_comments(p_user_id INT)
    RETURNS INT AS
$$
DECLARE
    comment_count INT;
BEGIN
    SELECT COUNT(*)
    INTO comment_count
    FROM Comments
    WHERE user_id = p_user_id;

    RETURN comment_count;
END;
$$
    LANGUAGE plpgsql;
