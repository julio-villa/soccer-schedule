export const parseDate = (dateString) => {
    let [month, day, year] = dateString.split('/');
    if (month.length === 1){
        month = "0" + month;
    }
    if (day.length === 1){
        day = "0" + day;
    }
    return( `${year}${month}${day}` );
};

export const calculateWeeksFrom = (dateFrom) => {

};