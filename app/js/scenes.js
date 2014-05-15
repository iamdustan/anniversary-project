import { Scene } from './scenes/_scene';

export var scenes = [
  {
    name: 'Introduction',
    scene: new Scene('Introduction'),
    content: [
      'Five years ago began the most wonderful part of my life.',
      'The woman beyond my dreams had agreed to be my wife.',
      'But first, let us travel back to where this journey began.'
    ]
  },
  {
    name: 'Livets Ord',
    scene: new Scene('Livets Ord', {element: 'livets-ord'}),
    content: [
      'It was the September of 2006 that we met.',
      'I can picture in my mind the moment you walked up to our group.',
      'I was happy to have another American in our small group.',
      'It wasn&rsquo;t long after our first encounter that I heard God say to me, ',
      '&ldquo;That woman will be your wife.&rdquo;'
    ]
  },
  {
    name: 'Tiramisu',
    scene: new Scene('Livets Ord', {element: 'tiramisu'}),
    content: [
      'The days and weeks passed and our friendship strengthened.',
      'Just beyond Christmas, in February of 2007 that we officially began our relationship.',
      'For our first date we went to Stockholm and enjoyed each other&rsquo;s companies and a meal at Tiramisu.'
    ]
  },
  {
    name: 'Uppsala',
    scene: new Scene('Uppsala', {element: 'uppsala'}),
    content: [
      'We enjoyed each others company most everyday for the rest of our time in Uppsala, Sweden.',
      'But all good things must come to an end.',
      'And as May drew to a close, our flights home and apart had come.'
    ]
  },
  {
    name: 'Interlude',
    scene: new Scene('Interlude'),
    content: [
      'I still remember those months apart as the most lonely and painful of my life.',
      'I had fallen in love with this woman.',
      'My feelings, hopes, and dreams had all been transformed to revolve around this southern girl.',
      'We didn&rsquo;t have a plan for how our lives would come together again.',
      'So we began to travel back and forth&mdash;to visit each other as much as we can.',
    ]
  },
  {
    name: 'Hutchinson',
    scene: new Scene('First trip to Hutchinson', {element: 'hutchinson'}),
    content: [
      'She came to me in Hutchinson, Minnesota first for a week in the summertime to meet my family.',
    ]
  },
  {
    name: 'Lincolnton',
    scene: new Scene('First trip to Lincolnton', {element: 'lincolnton'}),
    content: [
      'Then I came to Lincolnton, North Carolina for a week to meet her family.',
    ]
  },
  {
    name: 'Hutchinson',
    scene: new Scene('Second trip to Hutchinson', {element: 'hutchinson'}),
    content: [
      'Then she came to Hutchinson.',
    ]
  },
  {
    name: 'Lincolnton',
    scene: new Scene('Second trip to Lincolnton', {element: 'lincolnton'}),
    content: [
      'And I to Lincolnton.',
    ]
  },
  {
    name: 'Hutchinson',
    scene: new Scene('Third trip to Hutchinson', {element: 'hutchinson'}),
    content: [
      'And she to Hutchinson.',
    ]
  },
  {
    name: 'Lincolnton',
    scene: new Scene('Third trip to Lincolnton', {element: 'lincolnton'}),
    content: [
      'And I to Lincolnton.',
      'It &ldquo;snowed&rdquo;. School was canceled. Groceries were lacking milk and bread.',
      'There was no snow on the ground.',
    ]
  },
  {
    name: 'Hutchinson',
    scene: new Scene('Fourth trip to Hutchinson', {element: 'hutchinson'}),
    content: [
      'And she came to Hutchinson.',
      'It snowed. Real, proper snow.',
      '<br />',
      'That day it was decided. I would be moving to North Carolina.',
    ]
  },
  {
    name: 'Lincolnton',
    scene: new Scene('Move to Lincolnton', {element: 'lincolnton'}),
    content: [
      'I purchased a car in the July of 2008. I packed all of my things in it and drove down in August.',
      'And thus began our stateside life together.',
      'This was quite different from our life in Sweden. We were no longer students and had to work and learn how to have a relationship while the requirements of daily life began around us.',
    ]
  },
  {
    name: 'Lincolnton',
    scene: new Scene('Engaged. I ask', {element: 'lincolnton'}),
    content: [
      'And for Christmas, we got engaged.',
      'I said, "Kelly. Will you marry me?'
    ]
  },
  {
    name: 'Lincolnton',
    scene: new Scene('Engaged. She says yes. ', {element: 'lincolnton'}),
    content: [
      'Yes! Of course I will!'
    ]
  },
  {
    name: 'Lincolnton',
    scene: new Scene('Married', {element: 'courthouse'}),
    content: [
      'And on this day, May 16th, 5 years ago',
      'Kelly Renee Richards and Dustan Lee Kasten were wed.',
    ]
  },
];

