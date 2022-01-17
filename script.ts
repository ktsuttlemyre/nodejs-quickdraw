#!/usr/bin/env -S npx ts-node

import { training } from './model/train';
import { dataset } from 'utils';
import yargs from 'yargs';
import { createDataset, getDrawingsFiles } from './imageProcessing';

yargs.command('download [files]', 'download quickdraw dataset files', (yargs) => {
    yargs.positional('files', {
        describe: 'first n files to be downloaded from the dataset',
        type: 'number',
        default: 10
    })
}, (argv) => {
    console.log(`downloading ${argv.files} files ...`)
    getDrawingsFiles(argv.files as number);
})

    .command('create <type>', 'generate labels files', yargs => {
        yargs.positional('type', {
            describe: 'type of dataset to create: "training", "validation" or "testing"',
            default: 'training'
        })
    }, (argv) => {
        console.log(`generating ${argv.type} labels files ...`);
        createDataset(argv.type as dataset)
    })

    .command('train', 'train the model', {}, async (argv) => {
        console.log(`training model ...`);
        training();
    })

    .argv
