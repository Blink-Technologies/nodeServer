export default class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greeting() {
    console.log(`Hello, I am ${this.name} and I am ${this.age} years old.`);
  }
}
