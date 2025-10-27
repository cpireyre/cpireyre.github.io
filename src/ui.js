/*jslint browser */
const createUI = Object.freeze(
    function (canvas, STATES, onStartGame) {
        const container = document.createElement("div");
        Object.assign(container.style, {
            position: "relative",
            display: "inline-block"
        });
        const overlay = document.createElement("div");
        Object.assign(overlay.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            color: "white",
            fontFamily: "monospace",
            fontSize: "24px",
            zIndex: "10"
        });
        const scoreDisplay = document.createElement("h1");
        Object.assign(scoreDisplay.style, {
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center"
        });
        const startButton = document.createElement("button");
        Object.assign(startButton.style, {
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            fontFamily: "monospace",
            fontSize: "4em",
            left: "50%",
            pointerEvents: "auto",
            position: "absolute",
            textAlign: "center",
            top: "200px",
            transform: "translateX(-50%)"
        });
        startButton.innerHTML = `Click here`;
        startButton.onclick = function () {
            onStartGame();
        };

        canvas.parentNode.insertBefore(container, canvas);
        container.append(canvas, overlay);
        overlay.appendChild(scoreDisplay);
        container.appendChild(startButton);
        function showScore(G) {
            switch (G.state) {
            case STATES.GAME_OVER:
                return showScoreString(G);
            case STATES.START:
                return `Controls: WS, IK`;
            case STATES.PLAYING:
                return `${G.p1.score} | ${G.p2.score}`;
            }
        }

        return function updateUI(G) {
            scoreDisplay.textContent = showScore(G);
            if (G.state === STATES.PLAYING) {
                startButton.style.display = "none";
            } else {
                startButton.style.display = "block";
            }
        };
    }
);

export {createUI};

function showScoreString(G) {
    let winner = G.p1;
    let loser = G.p2;
    if (winner.score < loser.score) {
        [winner, loser] = [loser, winner];
    }
    return `${winner.name} wins! ${winner.score} to ${loser.score}`;
}
