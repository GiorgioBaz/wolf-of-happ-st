import Swal from "sweetalert2";

function showLoading(loading) {
    if (loading) {
        Swal.fire({
            title: "Loading",
            allowEscapeKey: false,
            backdrop: true,
            allowOutsideClick: () => !Swal.isLoading(),
            didOpen: () => Swal.showLoading(),
        });
    } else if (!loading) {
        Swal.close();
    }
}

export default showLoading;
