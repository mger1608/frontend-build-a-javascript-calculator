const numsArray = [
  { key: "7", id: "seven" },
  { key: "8", id: "eight" },
  { key: "9", id: "nine" },
  { key: "/", id: "divide" },
  { key: "4", id: "four" },
  { key: "5", id: "five" },
  { key: "6", id: "six" },
  { key: "X", id: "multiply" },
  { key: "1", id: "one" },
  { key: "2", id: "two" },
  { key: "3", id: "three" },
  { key: "-", id: "subtract" },
  { key: "0", id: "zero" },
  { key: ".", id: "decimal" },
  { key: "=", id: "equals" },
  { key: "+", id: "add" },
  { key: "AC", id: "clear" },
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keys: numsArray,
      expression: "0",
      currentDisplay: "0",
    };
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick(pad) {
    const { expression, currentDisplay } = this.state;
    let newExpression = expression;
    let newCurrent = currentDisplay;

    if (pad.key === "AC") {
      this.setState({ expression: "0", currentDisplay: "0" }); // User Story #7
      return;
    }

    if (pad.key === "=") {
      try {
        // Clean up and evaluate only the current expression (up to the last = or the full expression if no =)
        let evalPart = newExpression;
        if (newExpression.includes("=")) {
          evalPart = newExpression.split("=").pop() || newExpression; // Get the part after the last "="
        }

        // First, handle consecutive operators by keeping only the last non-negative operator
        evalPart = evalPart.replace(/([+X/])\s*[-+X/]+(?!\d)/g, '$1');
        // Then handle any remaining negative signs properly
        evalPart = evalPart.replace(/([+X/])\s*-\s*(\d)/g, '$1 -$2');

        // Clean up for evaluation
        evalPart = evalPart.replace(/X/g, "*").replace(/\s+/g, "");

        let result = eval(evalPart); // Evaluate just the current operation
        result = Number(result.toFixed(4)); // User Story #15: 4 decimal places precision

        // Update expression to show full chain and result
        const previousChain = newExpression.includes("=") ? newExpression : `${newExpression}=`;
        newExpression = `${previousChain}${result}`;
        newCurrent = result.toString(); // Show result in current display
        this.setState({ expression: newExpression, currentDisplay: newCurrent });
      } catch (error) {
        this.setState({ expression: "Error", currentDisplay: "Error" });
      }
      return;
    }

    // Handle numbers, decimals, and operators
    if (pad.key.match(/[0-9]/) || pad.key === "." || pad.key.match(/[-+X/]/)) {
      // Handle numbers
      if (pad.key.match(/[0-9.]/)) {
        // If current expression is just "0" or ends with "=" and a digit is pressed, replace with the digit
        if ((newExpression === "0" && pad.key !== ".") || newExpression.endsWith("=")) {
          newExpression = pad.key.match(/[0-9]/) ? pad.key : "0" + pad.key;
          newCurrent = newExpression;
        } else {
          // Check if we're adding to the current number
          const lastIsOperator = /[-+X/]$/.test(newExpression);

          // Handle consecutive zeros at start of number (User Story #10)
          if (pad.key === "0" && (newExpression === "0" || /[-+X/]0$/.test(newExpression))) {
            // Do nothing if trying to add multiple zeros at start
          } else if (pad.key === "." && /\.\d*$/.test(newExpression)) {
            // Prevent multiple decimals in one number (User Story #11)
          } else {
            // Add digit or decimal to expression
            newExpression += pad.key;

            // Update current display to show the current number being entered
            if (lastIsOperator) {
              newCurrent = pad.key;
            } else {
              newCurrent = newCurrent === "0" && pad.key !== "." ? pad.key : newCurrent + pad.key;
            }
          }
        }
      }
      // Handle operators
      else if (pad.key.match(/[-+X/]/)) {
        // If expression ends with a result from previous calculation
        if (newExpression.includes("=")) {
          // Start new calculation with the previous result
          const lastResult = currentDisplay;
          newExpression = lastResult + pad.key;
          newCurrent = lastResult;
        } else {
          // Handle consecutive operators - find any sequence of operators at the end
          const operatorMatch = newExpression.match(/[-+X/]+$/);

          if (operatorMatch) {
            const operatorSequence = operatorMatch[0];

            // If adding a non-negative operator after any operator sequence
            if (pad.key !== "-") {
              // Replace the entire operator sequence with the new operator
              newExpression = newExpression.slice(0, -operatorSequence.length) + pad.key;
            } 
            // If adding a minus sign
            else {
              // If the sequence already ends with a minus, replace it
              if (operatorSequence.endsWith("-")) {
                newExpression = newExpression.slice(0, -1) + pad.key;
              } 
              // Otherwise add the minus (for negative numbers)
              else {
                newExpression += pad.key;
              }
            }
          } else {
            // No consecutive operators, just add the new one
            newExpression += pad.key;
          }

          // Keep current display showing the last completed number
        }
      }
    }

    // Ensure newExpression isn't just an operator or empty
    if (newExpression.match(/^[-+X/]=?$/) || newExpression === "") {
      newExpression = "0";
      newCurrent = "0";
    }

    this.setState({ expression: newExpression, currentDisplay: newCurrent });
  }


      
      

  render() {
    return (
      <div id="calculator">
        <div id="display" 
          data-expression={this.state.expression} 
          data-current={this.state.currentDisplay}>
          {this.state.currentDisplay} {/* Add text content for tests */}
        </div>
        <div id="buttons">
          {this.state.keys.map((pad) => (
            <button
              id={pad.id}
              key={pad.key}
              onClick={() => this.handleClick(pad)}
            >
              {pad.key}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
