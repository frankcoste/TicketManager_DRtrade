FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["CoreAPI/CoreAPI.csproj", "CoreAPI/"]

RUN dotnet restore "CoreAPI/CoreAPI.csproj"
COPY . .

WORKDIR "/src/CoreAPI"
RUN dotnet build "CoreAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CoreAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CoreAPI.dll"]
