
REVOKE EXECUTE ON FUNCTION public.notify_course_students(uuid, text, text, text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_session_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_assignment_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_material_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_course_announcement(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_course_announcement(uuid, text, text) TO authenticated;
