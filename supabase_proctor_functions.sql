\nCREATE OR REPLACE FUNCTION increment_exam_flags(exam_uuid uuid)
RETURNS void AS $$
  UPDATE exams
  SET proctoring_flag_count = proctoring_flag_count + 1
  WHERE id = exam_uuid;
$$ LANGUAGE sql SECURITY DEFINER;
