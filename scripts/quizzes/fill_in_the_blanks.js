import { fillInTheBlanksQuestionBank } from './question_banks/fill_in_the_blanks.js';
import { saveQuizActivity } from './save.js';
import { alertPopup } from '../alert_popup.js';

let selectedQuestions = [];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomFillInTheBlanksQuestion(topic) {
    const questions = fillInTheBlanksQuestionBank[topic];
    return questions[Math.floor(Math.random() * questions.length)];
}

function generateQuiz() {
    document.getElementById('quiz-header').textContent = 'Kalkulukuizz: Fill in the Blanks!';
    document.getElementById('quiz-instruction').textContent = 'Fill in the blanks to complete the questions.';

    document.getElementById('quiz-submit-button').style.display = 'block';
    document.getElementById('quiz-again-button').style.display = 'none';

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    const topics = shuffleArray(['limit', 'derivative', 'integral']);

    topics.forEach(topic => {
        const questionObj = getRandomFillInTheBlanksQuestion(topic);
        selectedQuestions.push({ topic, question: questionObj });

        const topicDiv = document.createElement('div');
        topicDiv.classList.add('quiz-topic', `quiz-topic-${topic}`);

        const titleElement = document.createElement('h2');
        titleElement.classList.add('quiz-topic-title', `topic-${topic}-title`);
        titleElement.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('topic-content', `topic-${topic}-background`);

        const questionParts = questionObj.question.split('....');
        const questionElement = document.createElement('p');
        questionElement.classList.add('quiz-question');

        questionParts.forEach((part, index) => {
            questionElement.appendChild(document.createTextNode(part));

            if(index < questionParts.length - 1) {
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.classList.add('quiz-fill-in-the-blanks-input');
                inputField.setAttribute('placeholder', '');
                questionElement.appendChild(inputField);
            }
        });

        contentDiv.appendChild(questionElement);
        topicDiv.appendChild(titleElement);
        topicDiv.appendChild(contentDiv);
        quizContainer.appendChild(topicDiv);
    });
}

function submitQuiz() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const quizContainer = document.getElementById('quiz-container');

    let answered = 0;

    selectedQuestions.forEach(({ topic }) => {
        const quizTopicContainer = quizContainer.querySelector(`.quiz-topic.quiz-topic-${topic}`);
        const userAnswers = Array.from(quizTopicContainer.querySelectorAll('.quiz-fill-in-the-blanks-input')).map(input => input.value.trim());

        if(userAnswers[0]) answered ++;
    });

    if(answered) {
        let score = 0;
        let questions = {};

        selectedQuestions.forEach(({ topic, question }) => {
            const quizTopicContainer = quizContainer.querySelector(`.quiz-topic.quiz-topic-${topic}`);
            const quizTopicContentContainer = quizTopicContainer.querySelector('.topic-content');

            const userAnswers = Array.from(quizTopicContainer.querySelectorAll('.quiz-fill-in-the-blanks-input')).map(input => input.value.trim());
            
            const normaliseString = (str) => 
                str
                    .replace(/[\u0060\u2018\u2019]/g, "'")
                    .replace(/\s+/g, '')
                    .trim()
                    .toLowerCase();
            
            const isCorrect = question.correctAnswer.some(correct => 
                normaliseString(correct) === normaliseString(userAnswers[0])
            );
            
            if(isCorrect) score ++;

            questions[question.id] = {
                userAnswer: userAnswers[0] || 'Not answered',
                id: question.id
            };

            const reviewQuestion = document.createElement('div');
            reviewQuestion.classList.add('quiz-review-question');

            const userAnswerElement = document.createElement('p');
            userAnswerElement.classList.add('quiz-review-answer', 'quiz-user-answer', isCorrect ? 'quiz-correct-answer' : 'quiz-incorrect-answer');
            userAnswerElement.textContent = userAnswers[0] || 'Not answered';
            reviewQuestion.appendChild(userAnswerElement);

            const correctAnswerElement = document.createElement('p');
            correctAnswerElement.classList.add('quiz-review-answer', 'quiz-correct-answer');
            correctAnswerElement.textContent = question.correctAnswer[0];
            reviewQuestion.appendChild(correctAnswerElement);

            quizTopicContentContainer.appendChild(reviewQuestion);
        });
        
        saveQuizActivity("fill_in_the_blanks", score, 3, questions );

        const resultText = `You got ${score} out of ${selectedQuestions.length} correct. Keep it up!`;

        document.getElementById('quiz-header').textContent = 'Congrats!';
        document.getElementById('quiz-instruction').textContent = resultText;

        document.getElementById('quiz-submit-button').style.display = 'none';
        document.getElementById('quiz-again-button').style.display = 'block';

        const allInputFields = document.querySelectorAll('.quiz-fill-in-the-blanks-input');
        allInputFields.forEach(input => input.disabled = true);
    }
    else {
        alertPopup("Can not submit", "Please answer at least one question.")
    }
}

function resetQuiz() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    selectedQuestions = [];

    generateQuiz();
}

document.getElementById('quiz-submit-button').addEventListener('click', submitQuiz);
document.getElementById('quiz-again-button').addEventListener('click', resetQuiz);

window.onload = generateQuiz;
