export interface Question {
    question: string,
    code?: string,
    options: string[]
    question_number: number,
    correct_option: string,
    expected_time_sec: number,
}