
// Bless is an identity function purely to annotate string literals
// but without Polyscripting it allows the code to just keep working.
const bless = function(str) {
    return str;
}

const hidden_value = "The CEO's banking password is 'P@55w0rd'";

try {
    // safe string
    eval(bless(`
        console.log("I do only good things and you can read it.");
    `));
} catch (e) {
    console.log("Safe string errored and not expected: ", e);
}


try {
    // openly eval - can be validated and should work fine
    const unsafeString = bless(`
        console.log("I do only bad things, and you can read it clearly");
    `);

    eval(unsafeString);
} catch (e) {
    console.log("Open import shouldn't fail, but it did: ", e);
}


try {
    // mischievous unsafe string but imagine it was hidden much better.
    const message = `"); console.log("I just did a VERY bad thing without the caller knowing. I accessed their hidden value: " + hidden_value); console.log("`;

    // Bless will not work when not applied over a single string literal (because otherwise it can bless things you don't see)
    const unsafeString = bless(`console.log("` + message +  `");`);

    eval(unsafeString);
    console.log("Injection should fail, when Polyscripted. It worked this time. Not expected. Are you Polyscripted?");
} catch (e) {
}



try {
    const message = `"); console.log("I just did a VERY bad thing without the caller knowing. I accessed their hidden value: " + hidden_value); console.log("`;

    // In this case, the blessed parts will be polyscripted, but the message won't be - and injection will fail (only if polyscripting is applied)
    const unsafeString = bless(`console.log("`) + message +  bless(`");`);

    eval(unsafeString);
    console.log("Injection should fail, when Polyscripted. It worked this time. Not expected. Are you Polyscripted?");
} catch (e) {
}