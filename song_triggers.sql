CREATE OR REPLACE FUNCTION delete_primary_translation() RETURNS TRIGGER AS
$$
BEGIN
    DELETE FROM Annotations WHERE translation_id = OLD.id;
    DELETE FROM Comments WHERE translation_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_delete_primary_translation
    BEFORE DELETE
    ON Translations
    FOR EACH ROW
EXECUTE FUNCTION delete_primary_translation();



CREATE OR REPLACE FUNCTION search_new_primary_translation() RETURNS TRIGGER AS
$$
DECLARE
    new_primary_translation INT;
BEGIN
    IF EXISTS(SELECT 1 FROM Songs WHERE primary_translation = OLD.id) THEN
        SELECT id INTO new_primary_translation FROM Translations WHERE song_id = OLD.song_id AND id <> OLD.id LIMIT 1;
        IF new_primary_translation IS NOT NULL THEN
            UPDATE Songs SET primary_translation = new_primary_translation WHERE id = OLD.song_id;
        END IF;
    END IF;
    return OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_find_new_primary_translation
    BEFORE DELETE
    ON translations
    FOR EACH ROW
EXECUTE FUNCTION search_new_primary_translation();



CREATE OR REPLACE FUNCTION delete_remaining_songs() RETURNS TRIGGER AS
$$
BEGIN
    DELETE FROM Songs WHERE id = OLD.song_id AND primary_translation = OLD.id;
    return OLD;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER trigger_delete_remaining_translation
    AFTER DELETE
    ON translations
    FOR EACH ROW
EXECUTE FUNCTION delete_remaining_songs();