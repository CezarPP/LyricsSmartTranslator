CREATE OR REPLACE FUNCTION count_user_annotations(p_user_id INT)
    RETURNS INT AS
$$
DECLARE
    annotation_count INT;
BEGIN
    SELECT COUNT(*)
    INTO annotation_count
    FROM Annotations
    WHERE user_id = p_user_id;

    RETURN annotation_count;
END;
$$
    LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION check_overlap_annotations(p_begin_pos INT, p_end_pos INT, p_translation_id INT)
    RETURNS BOOLEAN AS
$$
DECLARE
    overlap_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
                   SELECT 1
                   FROM Annotations
                   WHERE translation_id = p_translation_id
                     AND (begin_pos, end_pos) OVERLAPS (p_begin_pos, p_end_pos)
               )
    INTO overlap_exists;

    RETURN overlap_exists;
END;
$$
    LANGUAGE plpgsql;
