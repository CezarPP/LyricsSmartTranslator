CREATE
    OR REPLACE FUNCTION count_user_translations(p_user_id INT)
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