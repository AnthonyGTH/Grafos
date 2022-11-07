import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  bufferLetter = '';
  letters = [];
  buffWeight = [];
  startLetter = '';
  finishLetter = '';
  dijkstra = new Dijkstra(); //Instancia de clase Dijkstra
  weightsBetweenLetters: { [k: string]: any } = {};
  i = 0;
  tempWeights: string[];
  constructor(private alertCtrl: AlertController) { }

  addLetter() {
// Metodo para agregar nuevo nodo, se valida que no haya existido antes
    let breaker = false;
    this.letters.forEach(element => {
      if (element === this.bufferLetter) {
        console.log(element + ' == ' + this.bufferLetter);
        breaker = true;
      }
    });
    if (!breaker) {
      this.letters[this.i] = this.bufferLetter;
      this.bufferLetter = '';
      this.i++;
    } else {
      alert('La letra ' + this.bufferLetter + ' ya existe');
      this.bufferLetter = '';
    }



  }

  addWeight(letraIn, letraOut, id, breaker = false) {
    // Metodo para ingesar un peso entre dos nodos, donde letraIn es el padre y letraOut el hijo
    if (this.weightsBetweenLetters[letraIn] === undefined) {
      this.weightsBetweenLetters[letraIn] = '';
    }
    if (this.buffWeight[id] !== undefined) {
      this.weightsBetweenLetters[letraIn] = this.weightsBetweenLetters[letraIn] + (letraOut + '=' + this.buffWeight[id] + ',');
      console.log(this.weightsBetweenLetters);
    }
    this.tempWeights = Object.keys(this.weightsBetweenLetters);
    if (!breaker) {
      this.addWeight(letraOut, letraIn, id, true);
    }
  }

  async calculate() {
    this.dijkstra.vertices = {};
    this.addVertex();
    const resultado = this.dijkstra.findShortestWay(this.startLetter, this.finishLetter);
    const comparador = resultado.length - 1;
    let dataMessage = '';
    for (let index = 0; index < comparador; index++) {
      if (dataMessage !== '') {
        dataMessage += ' -> ';
      }
      dataMessage += resultado[index];
    }
    dataMessage += '<br/><br/>Peso = ' + resultado[resultado.length - 1];
    console.log(this.startLetter, this.finishLetter);

    const alert = await this.alertCtrl.create({
      header: 'Resultados',
      subHeader: 'Mejor ruta para ir del nodo "' + this.startLetter + '" al nodo "' + this.finishLetter + '"',
      message: dataMessage,
      buttons: ['OK']
    });

    await alert.present();
  }


  addVertex() {
    // metodo para agregar vertice de datos con sus pesos entre otros nodos
    for (let index = 0; index < Object.keys(this.weightsBetweenLetters).length; index++) {
      const tempData = this.weightsBetweenLetters[Object.keys(this.weightsBetweenLetters)[index]];
      const arregloDeSubCadenas = tempData.split(',');
      let dataOfWeights = [];
      for (let i = 0; i < arregloDeSubCadenas.length; i++) {
        if (arregloDeSubCadenas[i] !== '') {
          const separado = arregloDeSubCadenas[i].split('=');
          const tempPartVertex = { nameOfVertex: separado[0], weight: parseInt(separado[1]) };
          dataOfWeights.push(tempPartVertex);
        }

        console.log(arregloDeSubCadenas.length, i, index, dataOfWeights);
      }
      console.log('Agregando vertice', Object.keys(this.weightsBetweenLetters)[index], dataOfWeights);
      this.dijkstra.addVertex(new Vertex(Object.keys(this.weightsBetweenLetters)[index], dataOfWeights, 1));
      dataOfWeights = [];
    }
  }

  ngOnInit(): void {

  }

  clearData() {
    // metodo para limpiar variables accionado por el boton
    this.weightsBetweenLetters = {};
    this.startLetter = '';
    this.finishLetter = '';
    this.buffWeight = [];
    this.letters = [];
    this.tempWeights = [];
    this.i = 0;
    this.dijkstra.vertices = {};
  }

}

class NodeVertex { //Interfaz de datos para nodo vertice
  nameOfVertex: string;
  weight: number;
}

class Vertex { //Interfaz de datos para vertice y sus pesos entre nodos
  name: string;
  nodes: NodeVertex[];
  weight: number;

  constructor(theName: string, theNodes: NodeVertex[], theWeight: number) {
    this.name = theName;
    this.nodes = theNodes;
    this.weight = theWeight;
  }
}

class Dijkstra {

  vertices: any;
  constructor() {
    this.vertices = {};
  }

  findPointsOfShortestWay(start: string, finish: string, weight: number): string[] {

    let nextVertex: string = finish;
    const arrayWithVertex: string[] = [];
    while (nextVertex !== start) {

      let minWeigth: number = Number.MAX_VALUE;
      let minVertex = '';
      for (const i of this.vertices[nextVertex].nodes) {
        if (i.weight + this.vertices[i.nameOfVertex].weight < minWeigth) {
          minWeigth = this.vertices[i.nameOfVertex].weight;
          minVertex = i.nameOfVertex;
        }
      }
      arrayWithVertex.push(minVertex);
      nextVertex = minVertex;
    }
    return arrayWithVertex;
  }

  addVertex(vertex: Vertex): void {
    // metodo para agrear vertices a el arreglo de vertices que existe en la clase instanciada dijkstra
    this.vertices[vertex.name] = vertex;
    console.log(this.vertices[vertex.name]);
  }

  findShortestWay(start: string, finish: string): string[] {
// funcion para calcular la ruta mas corta entre nodo inicio y nodo fin
    const nodes: any = {};
    const visitedVertex: string[] = [];
    console.log(this.vertices);

    for (const i in this.vertices) {
      if (this.vertices[i].name === start) {
        this.vertices[i].weight = 0;

      } else {
        this.vertices[i].weight = Number.MAX_VALUE;
      }
      nodes[this.vertices[i].name] = this.vertices[i].weight;
    }
    console.log(nodes);

    while (Object.keys(nodes).length !== 0) {
      const sortedVisitedByWeight: string[] = Object.keys(nodes).sort((a, b) => this.vertices[a].weight - this.vertices[b].weight);
      const currentVertex: Vertex = this.vertices[sortedVisitedByWeight[0]];
      for (const j of currentVertex.nodes) {
        const calculateWeight: number = currentVertex.weight + j.weight;
        if (calculateWeight < this.vertices[j.nameOfVertex].weight) {
          this.vertices[j.nameOfVertex].weight = calculateWeight;
        }


      }
      delete nodes[sortedVisitedByWeight[0]];
    }
    const finishWeight: number = this.vertices[finish].weight;
    const arrayWithVertex: string[] = this.findPointsOfShortestWay(start, finish, finishWeight).reverse();
    arrayWithVertex.push(finish, finishWeight.toString());
    return arrayWithVertex;
  }

}


