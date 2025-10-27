const dragAndDropQuestionBank = {
    limit: [
        {
            id: "DL1",
            question: "lim x→0 .... / .... = ....",
            pieces: ["x", "0", "cos(x)"],
            correctOrder: ["x", "cos(x)", "0"]
        },
        {
            id: "DL2",
            question: "lim n→∞ (1 + ....).... = ....",
            pieces: ["1/n", "ⁿ", "e"],
            correctOrder: ["1/n", "ⁿ", "e"]
        },
        {   
            id: "DL3",
            question: "lim x→0 (.... / ....) = ....",
            pieces: ["sin(x)", "x", "1"],
            correctOrder: ["sin(x)", "x", "1"]
        },
        {
            id: "DL4",
            question: "lim x→2 (x + ....) = ....",
            pieces: ["x", "2", "3", "5"],
            correctOrder: ["3", "5"]
        }
    ],
    derivative: [
        {
            id: "DD1",
            question: "d/dx (....) = ....",
            pieces: ["sin(x)", "sec(x)", "x²", "2x"],
            correctOrder: ["x²", "2x"]
        },
        {
            id: "DD2",
            question: "d/dx (....) = ....",
            pieces: ["eˣ", "ln(x)", "1/x", "eˣ"],
            correctOrder: ["eˣ", "eˣ"]
        },
        {
            id: "DD3",
            question: "d/dx (....) = ....",
            pieces: ["x²", "2x", "cos(x)"],
            correctOrder: ["x²", "2x"]
        },
        {
            id: "DD4",
            question: "d/dx (....) = ....",
            pieces: ["ln(x)", "log(x)", "1/x"],
            correctOrder: ["ln(x)", "1/x"]
        }
    ],
    integral: [
        {
            id: "DI1",
            question: "∫ .... dx = .... + C",
            pieces: ["x", "ln(x)", "1/x"],
            correctOrder: ["1/x", "ln(x)"]
        },
        {  
            id: "DI2",
            question: "∫ .... dx = .... + C",
            pieces: ["x", "x²/2", "ln|x|"],
            correctOrder: ["x", "x²/2"]
        },
        {
            id: "DI3",
            question: "∫ .... dx = .... + C",
            pieces: ["sec(x)", "sin(x)", "-cos(x)"],
            correctOrder: ["sin(x)", "-cos(x)"]
        },
        {
            id: "DI4",
            question: "∫ .... dx = .... + C",
            pieces: ["3", "3x","3/x", "0"]
        }
    ]
}

export { dragAndDropQuestionBank }
