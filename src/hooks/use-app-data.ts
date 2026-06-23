import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getCourses, getMyProfile } from "@/lib/api.functions";
import type { Course } from "@/lib/recommend";

export function useAppData() {
  const fetchCourses = useServerFn(getCourses);
  const fetchProfile = useServerFn(getMyProfile);

  const courses = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses() as Promise<Course[]>,
  });
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchProfile(),
  });

  return { courses, me };
}
