import { updateUserActivity } from "../updateUserActivity.js";

function saveQuizActivity(quizType, correct, total, questions) {
    const quizData = {
        correct,
        total,
        quizDetail: questions,
        timeStamp: new Date().toISOString()
    }
    updateUserActivity("quizzes", quizType, quizData);
}

export { saveQuizActivity };
