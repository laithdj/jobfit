export class Assessment {
    id: number = 0;
    label: string = "";
    value: string = "";
}

export class Postural {
    id: number = 0;
    back: Assessment[] = [];
    shoulder: Assessment[] = [];
    hand: Assessment[] = [];
    backSecond: Assessment[] = [];
    neck: Assessment[] = [];
    wristHand: Assessment[] = [];
    legFeet: Assessment[] = [];
    errorMessage: string = '';
}