
CREATE OR REPLACE FUNCTION increment_watch_attempts(vid_id uuid, uid uuid)
RETURNS int AS $$
  UPDATE video_progress
  SET watch_attempts = watch_attempts + 1
  WHERE video_id = vid_id AND user_id = uid
  RETURNING watch_attempts;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_test_stats(test_uuid uuid)
RETURNS json AS $$
  SELECT json_build_object(
    'total_attempts', COUNT(*),
    'pass_rate', ROUND(AVG(CASE WHEN all_passed THEN 1.0 ELSE 0.0 END) * 100, 1),
    'avg_easy_score', ROUND(AVG(easy_score::numeric), 1),
    'avg_medium_score', ROUND(AVG(medium_score::numeric), 1),
    'avg_hard_score', ROUND(AVG(hard_score::numeric), 1)
  )
  FROM test_attempts
  WHERE test_id = test_uuid;
$$ LANGUAGE sql SECURITY DEFINER;
