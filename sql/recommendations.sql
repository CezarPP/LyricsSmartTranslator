CREATE OR REPLACE FUNCTION count_common_words(text1 TEXT, text2 TEXT)
    RETURNS INT
AS
$$
DECLARE
    common_word_count INT := 0;
    i                 INT;
    text1_array       TEXT[];
    text2_array       TEXT[];
BEGIN
    -- Replace non-alphanumeric characters with spaces
    text1 := REGEXP_REPLACE(text1, '[^a-zA-Z0-9]', ' ', 'g');
    text2 := REGEXP_REPLACE(text2, '[^a-zA-Z0-9]', ' ', 'g');

    -- Convert the texts to lowercase to perform case-insensitive comparison
    text1 := LOWER(text1);
    text2 := LOWER(text2);

    text1_array := REGEXP_SPLIT_TO_ARRAY(text1, '\s+');
    text2_array := REGEXP_SPLIT_TO_ARRAY(text2, '\s+');

    FOR i IN 1..array_length(text1_array, 1)
        LOOP
            IF text1_array[i] = ANY (text2_array) THEN
                common_word_count := common_word_count + 1;
            END IF;
        END LOOP;

    RETURN common_word_count;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_song_recommendations_by_artist(p_user_id INT, n INT)
    RETURNS SETOF Songs
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.*
        FROM Songs s
                 JOIN Translations t ON s.primary_translation = t.id
        WHERE s.artist IN (SELECT s.artist
                           FROM Songs s
                                    JOIN Translations t ON s.primary_translation = t.id
                           WHERE t.user_id = p_user_id)
          AND t.user_id <> p_user_id
        GROUP BY s.id, s.artist, s.title
        ORDER BY COUNT(*) DESC
        LIMIT n;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_song_recommendations_by_comments_annotations(p_user_id INT, n INT)
    RETURNS SETOF Songs
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.*
        FROM Songs s
                 JOIN Translations t ON s.primary_translation = t.id
                 JOIN Comments c ON t.id = c.translation_id
        WHERE t.user_id <> p_user_id
          AND (c.content LIKE CONCAT('%', s.artist, '%')
            OR EXISTS (SELECT 1
                       FROM Annotations a
                       WHERE a.translation_id = t.id
                         AND (a.content LIKE CONCAT('%', s.artist, '%')
                           OR a.content LIKE CONCAT('%', s.title, '%'))))
        GROUP BY s.id, s.artist, s.title
        ORDER BY COUNT(*) DESC
        LIMIT n;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_song_recommendations_by_lyrics(p_user_id INT, n INT)
    RETURNS SETOF Songs
AS
$$
BEGIN
    RETURN QUERY
        SELECT DISTINCT ON (s.id) s.*
        FROM Songs s
                 JOIN Translations t ON s.primary_translation = t.id
                 JOIN Translations t2 ON t2.user_id = p_user_id
        WHERE count_common_words(t2.lyrics, t.lyrics) > 0
          AND t.user_id <> p_user_id
        GROUP BY s.id, t2.lyrics, t.lyrics
        ORDER BY s.id, count_common_words(t2.lyrics, t.lyrics) DESC
        LIMIT n;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_combined_recommendations(p_user_id INT, n INT)
    RETURNS TABLE
            (
                song_id             INT,
                primary_translation INT,
                image_id            INT,
                artist              VARCHAR(255),
                title               VARCHAR(255),
                link                TEXT
            )
AS
$$
DECLARE
    rec_by_artist            REFCURSOR;
    rec_by_comments          REFCURSOR;
    rec_by_lyrics            REFCURSOR;
    combined_recommendations RECORD;
    counter                  INT     := 0;
    already_recommended      INT[]   := ARRAY []::INT[];
    artist_has_more          BOOLEAN := TRUE;
    comments_has_more        BOOLEAN := TRUE;
    lyrics_has_more          BOOLEAN := TRUE;
    random_num               INT;
BEGIN
    OPEN rec_by_artist FOR SELECT * FROM get_song_recommendations_by_artist(p_user_id, 3 * n);
    OPEN rec_by_comments FOR SELECT * FROM get_song_recommendations_by_comments_annotations(p_user_id, 3 * n);
    OPEN rec_by_lyrics FOR SELECT * FROM get_song_recommendations_by_lyrics(p_user_id, 3 * n);

    LOOP
        EXIT WHEN counter = n OR NOT (artist_has_more OR comments_has_more OR lyrics_has_more);

        -- Randomly select a cursor
        random_num := (random() * 3)::INT;
        IF random_num = 0 THEN
            IF artist_has_more THEN
                FETCH NEXT FROM rec_by_artist INTO combined_recommendations;
                IF NOT FOUND THEN
                    artist_has_more := FALSE;
                    CONTINUE;
                END IF;
            ELSE
                CONTINUE;
            END IF;
        ELSIF random_num = 1 THEN
            IF comments_has_more THEN
                FETCH NEXT FROM rec_by_comments INTO combined_recommendations;
                IF NOT FOUND THEN
                    comments_has_more := FALSE;
                    CONTINUE;
                END IF;
            ELSE
                CONTINUE;
            END IF;
        ELSE
            IF lyrics_has_more THEN
                FETCH NEXT FROM rec_by_lyrics INTO combined_recommendations;
                IF NOT FOUND THEN
                    lyrics_has_more := FALSE;
                    CONTINUE;
                END IF;
            ELSE
                CONTINUE;
            END IF;
        END IF;


        -- Skip if this song has already been recommended
        IF combined_recommendations.song_id = ANY (already_recommended) THEN
            CONTINUE;
        END IF;

        -- Add this song to the list of recommended songs
        already_recommended := array_append(already_recommended, combined_recommendations.song_id);

        -- Return the fetched record
        song_id := combined_recommendations.song_id;
        primary_translation := combined_recommendations.primary_translation;
        image_id := combined_recommendations.image_id;
        artist := combined_recommendations.artist;
        title := combined_recommendations.title;
        link := combined_recommendations.link;
        RETURN NEXT;
        counter := counter + 1;
    END LOOP;

    -- Close cursors
    CLOSE rec_by_artist;
    CLOSE rec_by_comments;
    CLOSE rec_by_lyrics;
END;
$$ LANGUAGE plpgsql;
