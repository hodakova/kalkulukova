import { dragAndDropQuestionBank } from './question_banks/drag_and_drop.js';
import { saveQuizActivity } from './save.js';
import { alertPopup } from '../alert_popup.js';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomDragAndDropQuestion(topic) {
    const questions = dragAndDropQuestionBank[topic];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const shuffledPieces = shuffleArray([...randomQuestion.pieces]);
    return { ...randomQuestion, pieces: shuffledPieces }
}

function handleDrop(e) {
    e.preventDefault();
    const pieceText = e.dataTransfer.getData('text/plain');
    const dropSlot = e.target;

    if(!dropSlot.classList.contains('quiz-drag-and-drop-drop-slot')) return;

    const piecesArea = dropSlot.closest('.topic-content').querySelector('.quiz-drag-and-drop-pieces-area');
    const sourcePiece = document.querySelector(`.quiz-drag-and-drop-draggable-piece[data-piece="${pieceText}"]`);
    const existingPiece = dropSlot.querySelector('.quiz-drag-and-drop-draggable-piece');

    if(existingPiece) {
        if(sourcePiece && sourcePiece.closest('.quiz-drag-and-drop-pieces-area')) {
            piecesArea.appendChild(existingPiece);
            dropSlot.appendChild(sourcePiece);
        } else if(sourcePiece && sourcePiece.closest('.quiz-drag-and-drop-drop-slot')) {
            const sourceSlot = sourcePiece.closest('.quiz-drag-and-drop-drop-slot');
            sourceSlot.appendChild(existingPiece);
            dropSlot.appendChild(sourcePiece);
        }
    } else {
        if(sourcePiece && sourcePiece.closest('.quiz-drag-and-drop-pieces-area')) {
            dropSlot.appendChild(sourcePiece);
        } else if(sourcePiece && sourcePiece.closest('.quiz-drag-and-drop-drop-slot')) {
            const sourceSlot = sourcePiece.closest('.quiz-drag-and-drop-drop-slot');
            sourceSlot.setAttribute('data-empty', 'true');
            dropSlot.appendChild(sourcePiece);
        }
    }

    updateDropSlotState(dropSlot);
    if(sourcePiece && sourcePiece.closest('.quiz-drag-and-drop-drop-slot')) {
        updateDropSlotState(sourcePiece.closest('.quiz-drag-and-drop-drop-slot'));
    }
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
}

function handlePieceClick(e) {
    const piece = e.target;
    const dropSlot = piece.closest('.quiz-drag-and-drop-drop-slot');
    const piecesArea = piece.closest('.quiz-drag-and-drop-pieces-area') || dropSlot.closest('.topic-content').querySelector('.quiz-drag-and-drop-pieces-area');

    if(dropSlot) {
        piecesArea.appendChild(piece);
        dropSlot.setAttribute('data-empty', 'true');
        dropSlot.textContent = '';
    } else {
        const topicContent = piecesArea.closest('.topic-content');
        const dropSlots = Array.from(topicContent.querySelectorAll('.quiz-drag-and-drop-drop-slot'));
        const emptySlot = dropSlots.find(slot => slot.getAttribute('data-empty') === 'true');

        if(emptySlot) {
            emptySlot.appendChild(piece);
            updateDropSlotState(emptySlot);
        }
    }
}

function updateDropSlotState(dropSlot) {
    const pieceInSlot = dropSlot.querySelector('.quiz-drag-and-drop-draggable-piece');
    if(pieceInSlot) {
        dropSlot.setAttribute('data-empty', 'false');
    } else {
        dropSlot.setAttribute('data-empty', 'true');
    }
}

function disableDragAndDrop() {
    const allDraggablePieces = document.querySelectorAll('.quiz-drag-and-drop-draggable-piece');
    const allDropSlots = document.querySelectorAll('.quiz-drag-and-drop-drop-slot');

    allDraggablePieces.forEach(piece => {
        piece.draggable = false;
        piece.removeEventListener('dragstart', handleDragStart);
        piece.removeEventListener('click', handlePieceClick);
        piece.classList.add('quiz-drag-and-drop-undraggable-piece');
    });

    allDropSlots.forEach(slot => {
        slot.removeEventListener('dragover', (e) => e.preventDefault());
        slot.removeEventListener('drop', handleDrop);
    });
}



let selectedQuestions = [];

function generateQuiz() {
    document.getElementById('quiz-header').textContent = 'Kalkulukuizz: Drag and Drop!';
    document.getElementById('quiz-instruction').textContent = 'Drag the pieces to the correct order to complete the question.';

    document.getElementById('quiz-submit-button').style.display = 'block';
    document.getElementById('quiz-again-button').style.display = 'none';

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    const topics = shuffleArray(['limit', 'derivative', 'integral']);

    topics.forEach(topic => {
        const questionObj = getRandomDragAndDropQuestion(topic);
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
                const dropSlot = document.createElement('span');
                dropSlot.classList.add('quiz-drag-and-drop-drop-slot');
                dropSlot.setAttribute('data-empty', 'true');
                dropSlot.addEventListener('dragover', (e) => e.preventDefault());
                dropSlot.addEventListener('drop', handleDrop);
                questionElement.appendChild(dropSlot);
            }
        });

        const piecesArea = document.createElement('div');
        piecesArea.classList.add('quiz-drag-and-drop-pieces-area');
        questionObj.pieces.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('quiz-drag-and-drop-draggable-piece');
            pieceElement.setAttribute('data-piece', piece);
            pieceElement.textContent = piece;
            pieceElement.draggable = true;

            pieceElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', piece);
            });

            pieceElement.addEventListener('click', handlePieceClick);

            piecesArea.appendChild(pieceElement);
        });

        contentDiv.appendChild(questionElement);
        contentDiv.appendChild(piecesArea);

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

        const dropSlots = Array.from(quizTopicContainer.querySelectorAll('.quiz-drag-and-drop-drop-slot'));
        const userOrder = dropSlots
            .map(slot => slot.querySelector('.quiz-drag-and-drop-draggable-piece')?.textContent || null)
            .filter(piece => piece !== null);
        
        console.log(userOrder.join(', '));
        if(userOrder.join(', ')) answered ++;  
    });

    if(answered) {
        let score = 0;
        let questions = {};

        selectedQuestions.forEach(({ topic, question }) => {
            const quizTopicContainer = quizContainer.querySelector(`.quiz-topic.quiz-topic-${topic}`);
            const quizTopicContentContainer = quizTopicContainer.querySelector('.topic-content');

            const dropSlots = Array.from(quizTopicContainer.querySelectorAll('.quiz-drag-and-drop-drop-slot'));
            const userOrder = dropSlots
                .map(slot => slot.querySelector('.quiz-drag-and-drop-draggable-piece')?.textContent || null)
                .filter(piece => piece !== null);

            const isCorrect = JSON.stringify(userOrder) === JSON.stringify(question.correctOrder);
            if(isCorrect) score ++;

            questions[question.id] = {
                userAnswer: userOrder.join(', ') || 'Not answered',
                id: question.id
            };

            const reviewQuestion = document.createElement('div');
            reviewQuestion.classList.add('quiz-review-question');

            const userAnswerElement = document.createElement('p');
            userAnswerElement.classList.add('quiz-review-answer', 'quiz-user-answer', 'quiz-user-drag-and-drop-answer', isCorrect ? 'quiz-correct-answer' : 'quiz-incorrect-answer');
            userAnswerElement.textContent = `${userOrder.join(', ') || 'Not answered'}`;
            reviewQuestion.appendChild(userAnswerElement);

            const correctAnswerElement = document.createElement('p');
            correctAnswerElement.classList.add('quiz-review-answer', 'quiz-correct-answer', 'quiz-correct-drag-and-drop-answer');
            correctAnswerElement.textContent = `${question.correctOrder.join(', ')}`;
            reviewQuestion.appendChild(correctAnswerElement);

            quizTopicContentContainer.appendChild(reviewQuestion);
        });

        disableDragAndDrop();
        saveQuizActivity("drag_and_drop", score, 3, questions );

        const resultText = `You got ${score} out of ${selectedQuestions.length} correct. Keep it up!`;
        document.getElementById('quiz-header').textContent = 'Congrats!';
        document.getElementById('quiz-instruction').textContent = resultText;

        document.getElementById('quiz-submit-button').style.display = 'none';
        document.getElementById('quiz-again-button').style.display = 'block';
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
