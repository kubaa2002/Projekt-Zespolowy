namespace Projekt_Zespolowy.Models
{
    public struct ServiceResponse<T>
    {
        public readonly int ResponseCode;
        public readonly T ResponseBody;

        public ServiceResponse(int responseCode, T responseBody)
        {
            ResponseCode = responseCode;
            ResponseBody = responseBody;
        }
    }
}
