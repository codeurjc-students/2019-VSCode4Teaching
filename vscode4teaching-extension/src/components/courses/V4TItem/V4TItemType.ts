/**
 * Type of items (used as context for package.json contributed items)
 */
export enum V4TItemType {
    Login = "login",
    Logout = "logout",
    GetWithCode = "getwithcode",
    CourseTeacher = "courseteacher",
    CourseStudent = "coursestudent",
    ExerciseTeacher = "exerciseteacher",
    ExerciseStudent = "exercisestudent",
    AddCourse = "addcourse",
    NoCourses = "nocourses",
    NoExercises = "noexercises",
    Signup = "signup",
    SignupTeacher = "signupteacher",
}
