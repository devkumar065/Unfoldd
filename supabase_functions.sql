CREATE OR REPLACE FUNCTION increment_video_views(vid_id uuid)
RETURNS void AS $$
  UPDATE topic_videos 
  SET view_count = view_count + 1
  WHERE id = vid_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment(x int, row_id uuid)
RETURNS int AS $$
  UPDATE profiles 
  SET xp_points = xp_points + x
  WHERE id = row_id
  RETURNING xp_points;
$$ LANGUAGE sql SECURITY DEFINER;
