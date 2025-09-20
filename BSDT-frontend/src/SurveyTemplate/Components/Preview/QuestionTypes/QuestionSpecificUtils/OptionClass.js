class Option {
  constructor(text, value) {
    this.text = text;
    this.value = value;
  }

  static fromJSON(json) {
    return new Option(json.text, json.value);
  }
  toJSON() {
    return {
      text: this.text,
      value: this.value,
    };
  }
  toString() {
    return this.text;
  } 
  toValue() {
    return this.value;
  }
}

export default Option;