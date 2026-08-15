FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY JSport.Api.csproj ./
RUN dotnet restore JSport.Api.csproj

COPY . ./
RUN dotnet publish JSport.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID

ENTRYPOINT ["dotnet", "JSport.Api.dll"]
