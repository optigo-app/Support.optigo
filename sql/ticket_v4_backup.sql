USE [404146_CentralUser]
/****** Object:  StoredProcedure [dbo].[CallLog_Ticketv4]    Script Date: 21-11-2026 15:55:16 ******/
SET ANSI_NULLS ON

SET QUOTED_IDENTIFIER ON

ALTER PROCEDURE [dbo].[CallLog_Ticketv4]
     @con NVARCHAR(MAX)= ''
	,@p NVARCHAR(MAX)  = ''
AS
BEGIN
	SET NOCOUNT ON;
	
	DECLARE @FROMDate AS DATETIME=ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
	DECLARE @ProcedureName nvarchar(max)=OBJECT_NAME(@@PROCID)
	DECLARE @spname AS NVARCHAR(MAX)
	SELECT 
		@spname = COALESCE(@spname +char(13)+'	, ', '') + concat(A.name,' = ''', A.value ,'''')
	FROM (		
		SELECT name, value
		FROM (values
			(1, '@con', replace(cast(@con as NVARCHAR(MAX)),'''','''''')),
			(2, '@p', replace(cast(@p as NVARCHAR(MAX)),'''','''''')),
			(1, '--@con', replace(cast([dbo].Base64Decode(@con) as NVARCHAR(MAX)),'''','''''')),
			(2, '--@p', replace(cast(@p as NVARCHAR(MAX)),'''',''''''))
			) p(num, name, value)
	) AS A(name, value)		

	SET @spname=concat('exec [404146_CentralUser].[dbo].',OBJECT_NAME(@@PROCID),' ',@spname)
	DECLARE 
		  @DBNAME as NVARCHAR(50)=''
		, @STATIC_DBNAME as NVARCHAR(50)= ISNULL((select TOP(1) ISNULL(itaskdbname,'') from [404146_centraluser].dbo.inf),'')
		, @appuserid NVARCHAR(100)= '' 
		, @IPAddress NVARCHAR(50)= '' 
		, @FormName NVARCHAR(200)= ''
		, @mode NVARCHAR(100)= ''
		, @id NVARCHAR(50)= ''
		, @y NVARCHAR(100)= ''
		, @Authorization NVARCHAR(100)= ''
		, @domain NVARCHAR(50)= ''
		, @version as NVARCHAR(10)= ''
		, @ForEvt nvarchar(200)=''
	
	SELECT   @id= IIF(ISNULL(element_id,0) = 1,StringValue,@id)	
			,@mode= IIF(ISNULL(element_id,0) = 2,StringValue,@mode)	
			,@y= IIF(ISNULL(element_id,0) = 3,StringValue,@y)	
			,@appuserid= IIF(ISNULL(element_id,0) = 4,StringValue,@appuserid)	
			,@IPAddress= IIF(ISNULL(element_id,0) = 5,StringValue,@IPAddress)
			,@FormName= IIF(ISNULL(element_id,0) = 6,StringValue,@FormName)
			,@Authorization= IIF(ISNULL(element_id,0) = 7,StringValue,@Authorization)
			,@domain= IIF(ISNULL(element_id,0) = 8,StringValue,@domain)	
			,@version= IIF(ISNULL(element_id,0) = 9,StringValue,@version)
	FROM [404146_CentralUser].[dbo].[parseJSON]([dbo].Base64Decode(@con))
	
	PRINT 'step-2'
	PRINT ('--mode : ' + @mode)
	PRINT ('--y : ' + @y)
	PRINT ('--@Authorization : '+@Authorization)

	SET @DBNAME = ISNULL([dbo].[GetdbName](@y),'')

	PRINT CONCAT('@p :',@p)
	PRINT CONCAT('@DBNAME :',@DBNAME)
---------------------------------

DECLARE 
       @SQL NVARCHAR(MAX)=''
	  ,@SQL1 NVARCHAR(MAX)=''
	  ,@SQL2 NVARCHAR(MAX)=''
	  ,@SQL3 NVARCHAR(MAX)=''
	  ,@SQL4 NVARCHAR(MAX)=''
	  ,@SQL5 NVARCHAR(MAX)=''
	  ,@SQL6 NVARCHAR(MAX)=''
	  ,@SQL7 NVARCHAR(MAX)=''
	  ,@SQL8 NVARCHAR(MAX)=''
	  ,@SQL9 NVARCHAR(MAX)=''
	  ,@SQL10 NVARCHAR(MAX)=''

      ,@CallLogid INT = 0
      ,@UserId INT = 0
      ,@CateId TINYINT = 0
      ,@FilePath NVARCHAR(MAX)='' 
      ,@categoryname NVARCHAR(MAX)=''
      ,@DisplayOrder INT = 0
      ,@CustId INT = 0
      ,@ProjectId INT = 0
      ,@Keywords NVARCHAR(MAX) = ''
      ,@SendEmail BIT = 0
      ,@AppId INT = 0
      ,@PromiseDate DATE = NULL 
      ,@Subject NVARCHAR(MAX) = ''
	  ,@Descr NVARCHAR(MAX) = ''
      ,@CreatedBy INT = 0
      ,@TicketId INT = 0
      ,@StatusId INT = 0
      ,@PriorityId INT = 0
      ,@FollowUp NVARCHAR(20) = ''
      ,@Comment NVARCHAR(MAX)= ''
      ,@Filter NVARCHAR(MAX)=''
      ,@TicketNo NVARCHAR(MAX) =''
      ,@Projectcode NVARCHAR(MAX) = ''
      ,@Projectname NVARCHAR(MAX) = ''
      ,@Code NVARCHAR(MAX)=''
      ,@FirstName NVARCHAR(MAX)=''
      ,@MiddleName NVARCHAR(MAX)=''
      ,@LastName NVARCHAR(MAX)=''
      ,@Address NVARCHAR(MAX)=''
      ,@MobileNo BIGINT = 0
      ,@EmailId NVARCHAR(50)=''
      ,@Salary DECIMAL(18,2) = 0
      ,@EmpId INT = 0
      ,@Star BIT = 0
      ,@isOfficeUseOnly BIT = 0
      ,@SearchTerm NVARCHAR(MAX)=''
      ,@MainSubject NVARCHAR(MAX)=''
      ,@IsSuggested BIT = 0
      ,@Role BIT = 0
	  ,@Reopen BIT = 1
	  ,@IsClient INT = 0
	  ,@RatingValue FLOAT = 0
	  ,@RatingDescription NVARCHAR(MAX) = ''
	  ,@RatingBy NVARCHAR(MAX) = ''
	  ,@corporate NVARCHAR(255)=''
	  ,@CorpId INT = 0

	  ,@companycode NVARCHAR(100)=''
	  ,@psw NVARCHAR(200)=''
	  ,@Page INT=0
	  ,@PageSize INT=0
	  ,@ApiStatus NVARCHAR(100)=''
	  ,@StartDate NVARCHAR(100) = ''
	  ,@EndDate NVARCHAR(100) = ''
	  ,@CommentId INT=0
	  ,@NotificationId INT=0

	  ,@VideoName NVARCHAR(500) = ''
	  ,@VideoLang TINYINT = 0
	  ,@SectionName NVARCHAR(500) = ''
	  ,@Feedback TINYINT = 0
	  ,@UserName NVARCHAR(255) = ''
	  ,@UserPhone NVARCHAR(100) = ''

BEGIN TRY
	BEGIN
		
	
		IF(ISNULL(@p,'')<>'')
		BEGIN
			DECLARE @PTbl TABLE
			(
				 CallLogid INT 
				,UserId INT
				,CateId TINYINT 
				,Subject NVARCHAR(MAX) 
				,Descr NVARCHAR(MAX)
				,CreatedBy INT 
				,TicketId INT 
				,StatusId INT 
				,PriorityId INT 
				,FollowUp NVARCHAR(20)
				,Comment NVARCHAR(MAX)
				,Filter NVARCHAR(MAX)
				,TicketNo NVARCHAR(MAX) 
				,Projectcode NVARCHAR(MAX) 
				,Projectname NVARCHAR(MAX) 
				,Code NVARCHAR(MAX)
				,FirstName NVARCHAR(MAX)
				,MiddleName NVARCHAR(MAX)
				,LastName NVARCHAR(MAX)
				,Address NVARCHAR(MAX)
				,MobileNo BIGINT 
				,EmailId NVARCHAR(50)
				,Salary DECIMAL(18,2) 
				,FilePath NVARCHAR(MAX) 
				,categoryname NVARCHAR(MAX)
				,DisplayOrder INT 
				,CustId INT 
				,ProjectId INT 
				,Keywords NVARCHAR(MAX)
				,SendEmail BIT
				,AppId INT 
				,PromiseDate DATE
				,EmpId INT
				,Star BIT
				,isOfficeUseOnly BIT
				,SearchTerm NVARCHAR(MAX)
				,MainSubject NVARCHAR(MAX)
				,IsSuggested BIT
				,Role BIT 
				,Reopen BIT
				,IsClient INT
				,RatingValue FLOAT
				,RatingDescription NVARCHAR(MAX)
				,RatingBy NVARCHAR(MAX)
				,corporate NVARCHAR(255)
				,CorpId INT

				,companycode NVARCHAR(100)
				,psw NVARCHAR(200)
				,Page INT
				,PageSize INT
				,ApiStatus NVARCHAR(100)
				,StartDate NVARCHAR(100)
				,EndDate NVARCHAR(100)
				,CommentId INT
				,NotificationId INT

				,VideoName NVARCHAR(500)
				,VideoLang TINYINT
				,SectionName NVARCHAR(500)
				,Feedback TINYINT
				,UserName NVARCHAR(255)
				,UserPhone NVARCHAR(100)
			)
	BEGIN TRY
				BEGIN
					INSERT INTO @PTbl
					(
						 CallLogid 
						,UserId 
						,CateId 
						,Subject
						,Descr 
						,CreatedBy 
						,TicketId  
    					,StatusId  
						,PriorityId  
						,FollowUp 
						,Comment 
						,Filter 
						,TicketNo 
						,Projectcode 
						,Projectname 
						,Code
						,FirstName 
					    ,MiddleName 
						,LastName 
						,Address 
						,MobileNo 
						,EmailId 
						,Salary 
						,FilePath 
						,categoryname 
						,DisplayOrder 
						,CustId 
						,ProjectId 
						,Keywords 
						,SendEmail 
						,AppId 
						,PromiseDate
						,EmpId
						,Star
						,isOfficeUseOnly
						,SearchTerm
						,MainSubject
						,IsSuggested
						,Role
						,Reopen 
						,IsClient
						,RatingValue
						,RatingDescription
						,RatingBy
						,corporate
						,CorpId
						
						,companycode
						,psw
						,Page
						,PageSize
						,ApiStatus
						,StartDate
						,EndDate
						,CommentId
						,NotificationId

						,VideoName
						,VideoLang
						,SectionName
						,Feedback
						,UserName
						,UserPhone
					)				
				SELECT
						 isnull(CallLogid,0) as  CallLogid
						,isnull(UserId,0) as  UserId
						,isnull(CateId ,0) as CateId
						,isnull(Subject,'') as Subject
						,isnull(Descr ,'') as Descr
						,isnull(CreatedBy ,0) as CreatedBy
						,isnull(TicketId  ,0) as TicketId
						,isnull(StatusId  ,0) as StatusId
						,isnull(PriorityId  ,0) as PriorityId
						,isnull(FollowUp ,'') as FollowUp
						,isnull(Comment ,'') as Comment
						,isnull(Filter ,'') as Filter
						,isnull(TicketNo ,'') as TicketNo
						,isnull(Projectcode ,'') as Projectcode
						,isnull(Projectname ,'') as Projectname
						,isnull(Code ,'') as Code
						,isnull(FirstName ,'') as FirstName 
						,isnull(MiddleName ,'') as MiddleName
						,isnull(LastName ,'') as LastName
						,isnull(Address ,'') as Address
						,isnull(MobileNo ,0) as MobileNo
						,isnull(EmailId ,'') as EmailId
						,isnull(Salary ,0) as Salary
						,isnull(FilePath ,'') as FilePath
						,isnull(categoryname ,'') as categoryname
						,isnull(DisplayOrder ,0) as DisplayOrder
						,isnull(CustId ,0) as CustId
						,isnull(ProjectId ,0) as ProjectId
						,isnull(Keywords ,'') as Keywords
						,isnull(SendEmail ,0) as SendEmail
						,isnull(AppId ,0) as AppId
						,isnull(PromiseDate ,null) as PromiseDate
						,isnull(EmpId,'') as EmpId
						,isnull(Star,0) as star
						,isnull(isOfficeUseOnly,0) as isOfficeUseOnly
						,isnull(SearchTerm,'') as SearchTerm
						,isnull(MainSubject,'') as MainSubject
						,isnull(IsSuggested,0) as IsSuggested
						,isnull(Role,0) as Role
						,isnull(Reopen,1) as Reopen
						,isnull(IsClient, '') as IsClient
						,isnull(RatingValue, 0) as RatingValue
						,isnull(RatingDescription, '') as RatingDescription
						,isnull(RatingBy, '') as RatingBy
						,isnull(corporate, '') as corporate
						,isnull(CorpId, 0) as CorpId

						,isnull(companycode, '') as companycode
						,isnull(psw, '') as psw
						,isnull(Page, 0) as Page
						,isnull(PageSize, 0) as PageSize
						,isnull(ApiStatus, '') as ApiStatus
						,isnull(StartDate, '') as StartDate
						,isnull(EndDate, '') as EndDate
						,ISNULL(CommentId, 0) as CommentId
						,ISNULL(NotificationId, 0) as NotificationId

						,isnull(VideoName, '') as VideoName
						,isnull(VideoLang, 0) as VideoLang
						,isnull(SectionName, '') as SectionName
						,isnull(Feedback, 0) as Feedback
						,isnull(UserName, '') as UserName
						,ISNULL(UserPhone, '') AS UserPhone

			  FROM OPENJSON(ISNULL(@p,''))
					WITH 
					(
						 CallLogid INT '$.CallLogid'
						,UserId INT '$.UserId'
						,CateId TINYINT  '$.CateId'
						,Subject NVARCHAR(MAX) '$.Subject'
						,Descr NVARCHAR(MAX) '$.Descr'
						,CreatedBy INT '$.CreatedBy'
						,TicketId INT '$.TicketId'
    					,StatusId INT '$.StatusId'
						,PriorityId INT '$.PriorityId'
						,FollowUp NVARCHAR(20) '$.FollowUp'
						,Comment NVARCHAR(MAX) '$.Comment'
						,Filter NVARCHAR(MAX) '$.Filter'
						,TicketNo NVARCHAR(MAX) '$.TicketNo'
						,Projectcode NVARCHAR(MAX) '$.Projectcode'
						,Projectname NVARCHAR(MAX) '$.Projectname'
						,Code NVARCHAR(MAX) '$.Code'
						,FirstName NVARCHAR(MAX) '$.FirstName'
						,MiddleName NVARCHAR(MAX) '$.MiddleName'
						,LastName NVARCHAR(MAX) '$.LastName'
						,Address NVARCHAR(MAX) '$.Address'
						,MobileNo BIGINT  '$.MobileNo'
						,EmailId NVARCHAR(50) '$.EmailId'
						,Salary DECIMAL(18,2) '$.Salary'
						,FilePath NVARCHAR(MAX) '$.FilePath'
						,categoryname NVARCHAR(MAX) '$.categoryname'
						,DisplayOrder INT  '$.DisplayOrder'
						,CustId INT '$.CustId'
						,ProjectId INT '$.ProjectId'
						,Keywords NVARCHAR(MAX) '$.Keywords'
						,SendEmail BIT '$.SendEmail'
						,AppId INT '$.AppId'
						,PromiseDate DATE '$.PromiseDate'
						,EmpId INT '$.EmpId'
						,Star BIT '$.Star'
						,isOfficeUseOnly BIT '$.isOfficeUseOnly'
						,SearchTerm NVARCHAR(MAX) '$.SearchTerm'
						,MainSubject NVARCHAR(MAX) '$.MainSubject'
						,IsSuggested BIT '$.IsSuggested'
						,Role BIT '$.Role'
						,Reopen BIT '$.Reopen'
						,IsClient INT '$.IsClient'
						,RatingValue FLOAT '$.RatingValue'
						,RatingDescription NVARCHAR(MAX) '$.RatingDescription'
						,RatingBy NVARCHAR(MAX) '$.RatingBy'
						,corporate  NVARCHAR(255) '$.corporate'
						,CorpId INT '$.CorpId'

						,companycode NVARCHAR(100) '$.companycode'
						,psw NVARCHAR(200) '$.psw'
						,Page INT '$.Page'
						,PageSize INT '$.PageSize'
						,ApiStatus NVARCHAR(100) '$.ApiStatus'
						,StartDate NVARCHAR(100) '$.StartDate'
						,EndDate NVARCHAR(100) '$.EndDate'
						,CommentId INT '$.CommentId'
						,NotificationId INT '$.NotificationId'

						,VideoName NVARCHAR(500) '$.VideoName'
						,VideoLang TINYINT '$.VideoLang'
						,SectionName NVARCHAR(500) '$.SectionName'
						,Feedback TINYINT '$.Feedback'
						,UserName NVARCHAR(255) '$.UserName'
						,UserPhone NVARCHAR(255) '$.UserPhone'
		
					) AS a

					SELECT TOP 1 
																											
						 @CallLogid 		= CallLogid 		
						,@UserId 			= UserId 			
						,@CateId 			= CateId 			
						,@Subject 			= REPLACE(Subject, '''', '''''')
						,@Descr				= REPLACE(Descr, '''', '''''')
						,@CreatedBy			= CreatedBy			
						,@TicketId			= TicketId			
						,@StatusId			= StatusId			
						,@PriorityId		= PriorityId		
						,@FollowUp			= FollowUp			
						,@Comment			= REPLACE(Comment, '''', '''''')
						,@Filter			= Filter			
						,@TicketNo			= TicketNo			
						,@Projectcode		= Projectcode		
						,@Projectname		= Projectname		
						,@Code				= Code				
						,@FirstName			= FirstName			
						,@MiddleName		= MiddleName		
						,@LastName			= LastName			
						,@Address			= Address			
						,@MobileNo			= MobileNo			
						,@EmailId			= EmailId			
						,@Salary			= Salary			
						,@FilePath			= FilePath			
						,@categoryname		= categoryname		
						,@DisplayOrder		= DisplayOrder		
						,@CustId			= CustId			
						,@ProjectId			= ProjectId			
						,@Keywords			= Keywords			
						,@SendEmail			= SendEmail			
						,@AppId				= AppId				
						,@PromiseDate		= PromiseDate
						,@EmpId				= EmpId
						,@Star				= Star
						,@isOfficeUseOnly   = isOfficeUseOnly
						,@SearchTerm		= SearchTerm
						,@MainSubject		= REPLACE(MainSubject, '''', '''''')
						,@IsSuggested	    = IsSuggested
						,@Role				= Role
						,@Reopen			= Reopen
						,@IsClient			= IsClient
						,@RatingValue		= RatingValue
						,@RatingDescription = RatingDescription
						,@RatingBy			= RatingBy
						,@corporate			= corporate
						,@CorpId			= CorpId
						,@companycode		= companycode
						,@psw				= psw
						,@Page				= Page
						,@PageSize			= PageSize
						,@ApiStatus			= ApiStatus
						,@StartDate			= StartDate
						,@EndDate			= EndDate
						,@CommentId			= CommentId
						,@NotificationId	= NotificationId

						,@VideoName			= REPLACE(VideoName, '''', '''''')
						,@VideoLang			= VideoLang
						,@SectionName		= REPLACE(SectionName, '''', '''''')
						,@Feedback			= Feedback
						,@UserName			= REPLACE(UserName, '''', '''''')
						,@UserPhone			= UserPhone
										
				FROM @PTbl

				END
			END TRY
			BEGIN CATCH	 
				PRINT '--'
			END CATCH;
		END
	END

	PRINT CONCAT('@CallLogid : ',@CallLogid)
	PRINT CONCAT('@UserId : ',@UserId)
	PRINT CONCAT('@CateId : ',@CateId)
	PRINT CONCAT('@Subject : ',@Subject)
	PRINT CONCAT('@Descr : ',@Descr)
	---
	PRINT CONCAT('@FilePath	: ', @FilePath)
	PRINT CONCAT('@categoryname	: ',@categoryname)
	PRINT CONCAT('@DisplayOrder	: ',@DisplayOrder)
	PRINT CONCAT('@CustId : ',@CustId)
	PRINT CONCAT('@ProjectId : ',@ProjectId)  --
	PRINT CONCAT('@Keywords	: ',@Keywords)
	PRINT CONCAT('@SendEmail : ', @SendEmail)
	PRINT CONCAT('@AppId : ',@AppId)
	PRINT CONCAT('@PromiseDate : ',@PromiseDate)
	----
	PRINT CONCAT('@CreatedBy : ',@CreatedBy)
	PRINT CONCAT('@TicketId	: ',@TicketId)
	PRINT CONCAT('@StatusId	: ',@StatusId)
	PRINT CONCAT('@PriorityId : ',@PriorityId)
	PRINT CONCAT('@FollowUp	: ',@FollowUp)
	PRINT CONCAT('@Comment : ',@Comment)
	PRINT CONCAT('@Filter : ',@Filter)
	PRINT CONCAT('@TicketNo	: ',@TicketNo)
	PRINT CONCAT('@Projectcode : ',@Projectcode)
	PRINT CONCAT('@Projectname : ',@Projectname)
	PRINT CONCAT('@Code	: ',@Code)
	PRINT CONCAT('@FirstName : ',@FirstName)
	PRINT CONCAT('@MiddleName : ',@MiddleName)
	PRINT CONCAT('@LastName : ',@LastName)
	PRINT CONCAT('@Address : ',@Address)
	PRINT CONCAT('@MobileNo : ',@MobileNo)
	PRINT CONCAT('@EmailId : ',@EmailId)
	PRINT CONCAT('@Salary : ',@Salary)
	PRINT CONCAT('@EmpId : ' , @EmpId)
	PRINT CONCAT('@Star : ' , @Star)
	PRINT CONCAT('@isOfficeUseOnly : ',@isOfficeUseOnly)
	PRINT CONCAT('@SearchTerm : ',@SearchTerm)
	PRINT CONCAT('@MainSubject : ', @MainSubject)
	PRINT CONCAT('@IsSuggested : ', @IsSuggested)
	PRINT CONCAT('@Role : ', @Role)
	PRINT CONCAT('@Reopen : ', @Reopen)
	PRINT CONCAT('@IsClient :', @IsClient)
	PRINT CONCAT('@RatingValue :', @RatingValue)
	PRINT CONCAT('@RatingDescription :', @RatingDescription)
	PRINT CONCAT('@RatingBy :', @RatingDescription)
	PRINT CONCAT('@corporate :', @corporate)
	PRINT CONCAT('@CorpId :', @CorpId)
	PRINT CONCAT('@companycode :', @companycode)
	PRINT CONCAT('@psw :', @psw)
	PRINT CONCAT('@Page :', @Page)
	PRINT CONCAT('@PageSize :', @PageSize)
	PRINT CONCAT('@ApiStatus :', @ApiStatus)
	PRINT CONCAT('@StartDate :', @StartDate)
	PRINT CONCAT('@EndDate :', @EndDate)
	PRINT CONCAT('@CommentId :', @CommentId)
	PRINT CONCAT('@NotificationId :', @NotificationId)

	IF(ISNULL(@mode,'')='gettoken')
	BEGIN

		SET @SQL='
				DECLARE @CustUserId NVARCHAR(255);
				DECLARE @CustId INT = 0;
				DECLARE @companycode as nvarchar(200)=''''
	        
				IF('''+  @corporate +''' = ''true'')
				BEGIN
					SELECT 
						@CustUserId = usa.userid
					FROM ['+@DBNAME+'].dbo.corp_cust AS cc WITH(NOLOCK)
					LEFT JOIN ['+@DBNAME+ '].dbo.[usermanagement_systemloginmaster] AS usa WITH(NOLOCK)	
					ON cc.custid = usa.id
					WHERE cc.userid='''+@appuserid+'''

					SELECT TOP(1)
						@companycode=customercode
						,@CustId=id
					FROM ['+@DBNAME+'].dbo.usermanagement_systemloginmaster WITH(NOLOCK)
					WHERE userid=@CustUserId
				END
				ELSE
				BEGIN
					SET @CustUserId = '''+@appuserid+'''

					SELECT TOP(1)
						@companycode=companycode
					FROM [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission WITH(NOLOCK)
					WHERE dbname='''+@DBNAME+'''

					SELECT TOP(1)
						@CustId = id
					FROM ['+@DBNAME+'].dbo.usermanagement_systemloginmaster WITH(NOLOCK)
					WHERE userid='''+@appuserid+'''
				END

				SELECT 
	        		dbUniqueKey  as token
					,id AS companyId
	        		,ISNULL(ukey,'''')  as ukey
					,serverid as sv
	        		,''https://cdnfs.optigoapps.com/content-global3'' as url_path
	        		,@companycode as companycode
				FROM [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission WITH(NOLOCK)
				WHERE dbname='''+@DBNAME+'''


				SELECT TOP(1) id
	        		,ISNULL(firstname,'''') as firstname
	        		,ISNULL(lastname,'''') as lastname
	        		,ISNULL(customercode,'''') as customercode
	        		,ISNULL(firmname,'''') as firmname
	        		,ISNULL(designation,'''') as designation
					,iif(isnull(mastermanagement_roleid,0)=3
						,iif(ISNULL(designation,'''')=''admin'',1,2)
						,isnull(mastermanagement_roleid,0))
						as roleid
					,iif(isnull(mastermanagement_roleid,0)=3
						,iif(ISNULL(designation,'''')=''admin'',''admin'',''employee'')
						,'''')
						as role
				FROM ['+@DBNAME+'].dbo.usermanagement_systemloginmaster WITH(NOLOCK)
				WHERE userid=@CustUserId

				SELECT TOP(1) id
					,ISNULL(custid, '''') as custid
	        		,ISNULL(firstname,'''') as firstname
	        		,ISNULL(lastname,'''') as lastname
	        		,ISNULL(usercode,'''') as customercode
					,isnull(userid, '''') as userid
				FROM ['+@DBNAME+'].dbo.corp_cust WITH(NOLOCK)
				WHERE userid='''+@appuserid+'''

				SELECT
					id
					,title as pagename 
				FROM ['+@DBNAME+'].[dbo].usermanagement_role_pages WITH (NOLOCK)
				WHERE id in (
					SELECT
						ISNULL([usermanagement_role_pagesid],0)
					FROM ['+@DBNAME+'].[dbo].[UserManagement_UserRightsBinding] WITH (NOLOCK)
					WHERE Usermanagement_systemloginmasterid=@CustId
					AND appsname=''TASKMGT''
					AND (ISNULL(''' + @corporate + ''', '''') = '''')
				)

		'

		PRINT (@SQL)
		EXEC (@SQL)
	END
	ELSE IF(ISNULL(@mode,'')='EMPLOYEE_LIST')
	BEGIN

		SET @SQL = '
			SELECT
				us.id AS userid,
				LTRIM(RTRIM(
					ISNULL(us.firstname, '''') + '' '' +
					CASE
						WHEN ISNULL(us.middlename, '''') <> ''''
							THEN us.middlename + '' ''
						ELSE ''''
					END +
					ISNULL(us.lastname, '''')
				)) AS [user],
				us.designation,
				d.id AS DesignationId
			FROM ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] AS us WITH (NOLOCK)
			INNER JOIN ['+@DBNAME+'].[dbo].[Mastermanagement_Designation] AS d WITH (NOLOCK)
				ON d.Designationname = us.designation
			WHERE us.id <> '+convert(nvarchar(max),isnull(@EmpId,0))+'
				AND ISNULL(us.IsActive, 0) = 1
				AND ISNULL(us.IsDelete, 0) = 0
				AND ISNULL(us.designation, '''') <> '''';
			';
		  PRINT (@SQL)
		  EXEC (@SQL)
	END 
	ELSE IF(ISNULL(@mode,'')='CLOSETICKET')
	BEGIN
			  SET @SQL ='
						 DECLARE @ErrorMsg NVARCHAR(200) = '''',
								 @OldStatusId INT = 0,
								 @TicketCreatedBy INT = 0,
								 @ProjectId INT = 0,
								 @ProjectCode NVARCHAR(MAX) = '''',
								 @CreatedByCode NVARCHAR(200) = '''';

						 IF NOT EXISTS (
							SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Tickets] 
							WHERE TicketNo = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+''' 
							AND IsActive = 1
						)	
						 BEGIN
							  SET @ErrorMsg += ''TicketNo does not exists.'';
						 END
			     
						 IF LEN(@ErrorMsg) > 0
						 BEGIN
							 SELECT 
								  0 AS stat
								 ,@ErrorMsg AS stat_msg
								 ,1001 as stat_code;						  
							 RETURN;
						 END

						  -- Get values for notification
						 SELECT @OldStatusId = StatusId, @TicketCreatedBy = CreatedBy, @ProjectId = ProjectId, @ProjectCode = ProjectCode, @CreatedByCode = CreatedByCode
						 FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] 
						 WHERE TicketNo = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+''' AND IsActive = 1;

						 --IF EXISTS (SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] WITH(NOLOCK) WHERE  TicketNo = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+''' AND CreatedBy = '+convert(nvarchar(255), isnull(@CreatedBy, 0))+'  
							--		AND IsActive = 1)
						 --BEGIN

                            DECLARE @UpdatedByName NVARCHAR(100);
                            SELECT 
                                @UpdatedByName = LTRIM(RTRIM(
                                    ISNULL(CU.firstname, '''') + '' '' +
                                    CASE WHEN ISNULL(CU.middlename, '''') <> '''' THEN CU.middlename + '' '' ELSE '''' END +
                                    ISNULL(CU.lastname, '''')
                                )) 
                            FROM ['+ @DBNAME +'].[dbo].[Usermanagement_systemloginmaster] AS CU WITH(NOLOCK)
                            WHERE id = ' + convert(nvarchar(255), isnull(@CreatedBy, 0)) + ';
							';

			SET @SQL1 = '
							UPDATE ct
							SET 	
								   ct.statusId        = case when '+convert(nvarchar(255),isnull(@Reopen,0)) +' = 0 THEN 37 ELSE 26 END
								  ,ct.TicketCloseTime = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
								  ,ct.UpdatedBy       = '+convert(nvarchar(255),isnull(@CreatedBy,0)) +'
                                  ,ct.UpdatedByName   = @UpdatedByName
								  ,ct.ModifiedDate    = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets]  ct WITH(NOLOCK)
							WHERE ct.IsActive = 1
							  AND ct.TicketNo = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+'''
						';

			SET @SQL2 = '
					DECLARE @onesignal_SubPlayid NVARCHAR(MAX),
							@Onesignal_Appid NVARCHAR(255),
							@Onesignal_RestApiKey NVARCHAR(255),
							@NotificationContent NVARCHAR(MAX),
							@NotificationHeading NVARCHAR(MAX),
							@AppRegId_Internal INT;

					IF ' + convert(nvarchar(255),isnull(@Reopen,0)) + ' = 0
					BEGIN
						SET @NotificationHeading = ''Closed tickets'';
						SET @NotificationContent = ''Your issue #'' + ''' + convert(nvarchar(255),isnull(@TicketNo,'''')) + ''' + '' is resolved and closed.'';
					END
					ELSE
					BEGIN
						SET @NotificationHeading = ''Ticket Reopened'';
						SET @NotificationContent = ''Your ticket #'' + ''' + convert(nvarchar(255),isnull(@TicketNo,'''')) + ''' + '' has been reopened.'';
					END

					INSERT INTO ['+@DBNAME+'].[dbo].[CSystem_Notification](
						CompanyCode, CompanyId, FromUserId, Title, Message, Module, EntryDate
					) values (
						@ProjectCode, @ProjectId, '+convert(nvarchar(255),isnull(@CreatedBy,0)) +', @NotificationHeading, @NotificationContent, ''ticket'', ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
					);

					SELECT @AppRegId_Internal = appid FROM [404146_CentralUser].[dbo].[Appmanagement_AppMaster] WITH(NOLOCK) WHERE appname = ''Optigo Carely'';

					SELECT @Onesignal_Appid = Onesignal_Appid, @Onesignal_RestApiKey = Onesignal_RestApiKey
					FROM [404146_CentralUser].[dbo].[Onesignal_AppDetail] WITH(NOLOCK)
					WHERE Onesignal_AppName = ''Optigo Carely'';

					SELECT @onesignal_SubPlayid = ''['' + STRING_AGG(''"'' + osl.onesignal_SubPlayid + ''"'', '','') + '']''
					FROM [404146_CentralUser].[dbo].[onesignallist] AS osl WITH(NOLOCK)
					INNER JOIN [404146_CentralUser].[dbo].[Appmanagement_Device] AS Ad WITH(NOLOCK)
						ON Ad.SystemLoginId = osl.SystemLoginid AND Ad.DeviceId = osl.deviceid
					WHERE osl.SystemLoginid IN (SELECT id FROM [' + @DBNAME + '].dbo.[corp_cust] WHERE custid = @ProjectId)
					AND Ad.AppId = @AppRegId_Internal
					AND Ad.IsEnable = 1
					AND osl.dbname = @CreatedByCode;
				';

			SET @SQL3 = '
							SELECT
								1 AS stat
							 ,''The ticket has been closed successfully.'' AS stat_msg
							 ,1000 AS stat_code
							 ,@onesignal_SubPlayid AS Onesignal_SubPlayid
							 ,@Onesignal_Appid AS Onesignal_Appid
							 ,@Onesignal_RestApiKey AS Onesignal_RestApiKey
							 ,''ticket'' AS Module
							 ,''' + convert(nvarchar(255),@TicketNo) + ''' AS TicketNo
							 ,@NotificationHeading AS Heading
							 ,@NotificationContent AS Content;
				';
				
				SET @SQL4 = '

							SELECT 
								ct.TicketId
								,ISNULL(ct.CallLogId,0) AS CallId
								,ct.TicketNo
								,ct.MainSubject
								,ct.Subject AS subject 
								,ct.Descr AS instruction
								,ct.Filepath AS attachment
								,ct.FollowUp AS FollowUp
								,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
								,ct.star
								,ct.TicketCloseTime
								,ISNULL(ct.IsClient, 0) AS IsClient
								,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
								,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
								,ISNULL(ct.IsActive,'''') IsActive
								,ct.SendEmail AS sendMail
								,ISNULL(ct.Keywords,'''') keywords
								,ct.IsSuggested AS isSuggested
								,ISNULL(ct.CreatedByName, '''') AS CreatedBy
								,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
								,ISNULL(ct.ProjectCode, '''') AS companyname
								,ISNULL(ct.CustName,'''') AS username
								,ct.CreatedByCode AS CreatedByCode
								,ISNULL(c.categoryname,'''') category
								,ISNULL(A.AppName,'''') appname
								,ISNULL(s.Name,'''') Status
								,ISNULL(p.Name,'''') Priority
								,ISNULL(REPLACE(
									(
										SELECT 
											cc.CommentId AS id
											,ISNULL(cc.Comments,'''') AS message
											,ISNULL(cc.FilePath,'''') AS attachment
											,cc.isOfficeUseOnly
											,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
											,cc.CreatedByName AS Name
											,cc.CreatedDate AS time
										FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
										WHERE cc.TicketNo = ct.TicketNo
										FOR JSON PATH
									), 
								''\/'', ''/''), 
								'''') AS comments
							FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] AS ct WITH(NOLOCK)
							LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
							LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
							LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
							LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
							WHERE ct.TicketNo = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+''';

						 --END
						 --ELSE
						 --BEGIN
							--SELECT 
							--	 0 as stat
							--	,''Ticket number does not exist.'' as stat_msg
							--	,1001 as stat_code;
						 --END
				'

			PRINT(@SQL)
			PRINT(@SQL1)
			PRINT(@SQL2)
			PRINT(@SQL3)
			PRINT(@SQL4)
			EXEC(@SQL+@SQL1+@SQL2+@SQL3+@SQL4)
	END
	ELSE IF(ISNULL(@mode,'')='FILTER')
	BEGIN

			SET @SQL ='
					   SELECT 
					 		 ''APPNAME'' type
					 		 ,AppId
					 		 ,AppName
					   FROM ['+@DBNAME+'].[dbo].[CallLog_AppName] WITH(NOLOCK)
					   WHERE IsActive = 1
					   ORDER BY DisplayOrder ASC;
	------------------------------------------------------

					   SELECT
							''CompanyName'' type
							,id
							,customercode AS companyname
						FROM ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] AS USM WITH (NOLOCK)
						WHERE ISNULL(Mastermanagement_roleid, 0) = 4 
							AND ISNULL(IsActive, 0) = 1
							AND ISNULL(customercode,'''')<>''''
							AND ISNULL(IsDelete, 0) = 0
						ORDER BY id;

	------------------------------------------------------
					   SELECT  
							 ''CATEGORY'' type 
				   			 ,CateId
				   			 ,categoryname
					   FROM ['+@DBNAME+'].[dbo].[CallLog_category] WITH(NOLOCK)
					   WHERE IsActive = 1
	------------------------------------------------------						
					   SELECT  
				   		   ''Status'' type
				   		   ,StatusID
				   		   ,Name
					   FROM ['+@DBNAME+'].dbo.[CallLog_status] WITH(NOLOCK)
					   WHERE IsActive = 1 AND StatusID IN(12,25,26,27,28,29,8,10,32,33,5,35,36,37,38,7,40,41,42,43);					
	------------------------------------------------------					
					   SELECT  
				   		   ''PRIORITY'' type
				   		   ,PriorityID
				   		   ,Name 
					   FROM ['+@DBNAME+'].dbo.[CallLog_Priority] with(nolock)
					   WHERE IsActive = 1
					   ORDER BY DisplayOrder ASC;
	--------------------------------------------------------						
					   SELECT 
					 		  ''FOLLOW UP'' type
					 		  , FOLLOW 
						 FROM
							  (
		 						SELECT CAST(''Follow Up 1'' AS NVARCHAR(15)) AS FOLLOW
		 						UNION ALL
		 						SELECT CAST(''Follow Up 2'' AS NVARCHAR(15)) AS FOLLOW
							  )  AS FOLLOWUPOptions;					
	------------------------------------------------------	
					  SELECT ''Username''
							 ,Id
							 ,concat(firstname,'' '',lastname) username
					  FROM ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] WITH(NOLOCK)
					  WHERE [Mastermanagement_roleid] in (4,9) AND ISNULL([IsDelete],0)=0
					  ORDER BY CONCAT(firstname,'' '',lastname) ASC;
	--------------------------------------------------------	
						SELECT
							cc.id AS Id
							,cc.userid AS UserId
							,concat(cc.firstname,'' '', cc.lastname) UserName
							,cc.custid AS CustId
							,us.customercode AS CustomnerCode
						FROM ['+@DBNAME+'].[dbo].[corp_cust] AS cc WITH(NOLOCK)
						LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] AS us with (nolock)
						ON us.id = cc.custid;
					'
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF(ISNULL(@mode,'')='WABAGETTICKET')
	BEGIN
		SET @SQL ='
			DECLARE @UserPhone NVARCHAR(50) = ''' + RIGHT(CONVERT(NVARCHAR(50), ISNULL(@UserPhone, '''')), 10) + ''',
					@TicketNo NVARCHAR(50) = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+''',
					@TicketId INT = 0,
					@CorpId INT,
					@CompanyId INT,
					@CompanyCode nvarchar(255),
					@Subjest NVARCHAR(MAX),
					@Descr NVARCHAR(MAX),
					@Status NVARCHAR(50),
					@Category NVARCHAR(50),
					@AppName NVARCHAR(50),
					@Date NVARCHAR(100),
					@Message NVARCHAR(MAX);

				SELECT TOP 1
					@CorpId = coc.id,
					@CompanyId = coc.custid,
					@CompanyCode = usl.customercode
				FROM ['+@DBNAME+'].[dbo].[corp_cust] coc WITH(NOLOCK)
				INNER JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] usl WITH (NOLOCK)
					ON usl.Id = coc.custid
				WHERE RIGHT(CONVERT(NVARCHAR(50), ISNULL(coc.mobile, '''')), 10) = @UserPhone;

				SELECT
					@TicketId = cti.TicketId
					,@TicketNo = cti.TicketNo
					,@Subjest = cti.Subject
					,@Descr = cti.Descr
					,@Status = ISNULL(cst.Name, '''')
					,@Category = ISNULL(cct.categoryname, '''')
					,@AppName = ISNULL(can.AppName, '''')
					,@Date = cti.PromiseDate
				FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] cti with(nolock)
				LEFT JOIN ['+@DBNAME+'].[dbo].[CallLog_status] cst with(nolock)
					ON cst.StatusID = cti.statusId
				LEFT JOIN ['+@DBNAME+'].[dbo].[CallLog_AppName] can with(nolock)
					ON can.AppId = cti.AppId 
				LEFT JOIN ['+@DBNAME+'].[dbo].[CallLog_Category] cct with(nolock)
					ON cct.CateId = cti.CateId
				WHERE cti.TicketNo = @TicketNo
				AND cti.ProjectId = @CompanyId

				IF(@TicketId <> 0)
				BEGIN
					SET @Message =
						  N''• *Ticket ID:* '' + ISNULL(@TicketNo, N'''')
						+ CHAR(13) + CHAR(10)
						+ N''• *Topic:* '' + ISNULL(@Subjest, N'''')
						+ CHAR(13) + CHAR(10)
						+ N''• *Status:* '' + ISNULL(@Status, N''N/A'')
						+ CHAR(13) + CHAR(10)
						+ N''• *ETA:* '' + ISNULL(@Date, N''N/A'');

					SELECT
						 1 as stat
						, @Message as WabaMessage
						,100 as stat_code;
						
				END
				ELSE
				BEGIN
					SELECT
						 0 as stat
						,''Ticket Not Found'' as stat_msg
						,''Ticket Not Found'' as WabaMessage
						,1001 as stat_code	
				END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	Else IF(ISNULL(@mode,'')='WABAADDTICKET')
	BEGIN
		SET @SQL = '
			DECLARE @UserPhone NVARCHAR(50) = ''' + RIGHT(CONVERT(NVARCHAR(50), ISNULL(@UserPhone, '''')), 10) + ''',
					@Descr NVARCHAR(MAX) = '''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Descr)), '')), '''', '''''') +''',
					@IsClient INT = '+convert(nvarchar(255),isnull(@IsClient,0)) +',
					@CompanyId INT = 0,
					@CorpId INT = 0,
					@CompanyCode NVARCHAR(50) = '''',
					@CustomerName NVARCHAR(100) = '''',
					@callLogautoIncrement INT,
					@InsertedId INT;

			SELECT TOP 1
				@CorpId = coc.id,
				@CompanyId = coc.custid,
				@CustomerName = LTRIM(RTRIM(
									LTRIM(RTRIM(ISNULL(coc.firstname, ''''))) + '' '' +
									LTRIM(RTRIM(ISNULL(coc.lastname, '''')))
								)),
				@CompanyCode = usl.customercode
			FROM ['+@DBNAME+'].[dbo].[corp_cust] coc WITH(NOLOCK)
			INNER JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] usl WITH (NOLOCK)
				ON usl.Id = coc.custid
			WHERE RIGHT(CONVERT(NVARCHAR(50), ISNULL(coc.mobile, '''')), 10) = @UserPhone;

			INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Tickets] (
				 CustId ,CateId, ProjectId ,Subject ,Descr ,CreatedBy  ,CreatedDate ,ProjectCode 
				 ,CreatedByCode ,IsClient ,CustName ,CreatedByName ,CorpId
			)
			VALUES (
				@CorpId
				,1
				,@CompanyId
				,@Descr
				,@Descr
				, @CompanyId
				,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
				,@CompanyCode
				,'''+@DBNAME+'''
				,@IsClient
				,@CustomerName
				,@CustomerName
				,@CorpId
			)

			SET  @InsertedId  = SCOPE_IDENTITY();

			-- Tocket No Generate Logic
			DECLARE @Year INT = YEAR(ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE()));
			DECLARE @WeekNo INT = DATEPART(WEEK, ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE()));
			DECLARE @Seq INT;
			
			-- Get sequence for current year/week
			SELECT 
				@Seq = ISNULL(MAX(CAST(RIGHT(TicketNo, 3) AS INT)) + 1, 1)
			FROM [' + @DBNAME + '].[dbo].[CallLog_Tickets] WITH (NOLOCK)
			WHERE DATEPART(YEAR, CreatedDate) = @Year
			AND DATEPART(WEEK, CreatedDate) = @WeekNo;

			-- Build TicketNo
			DECLARE @TicketNo NVARCHAR(20) = 
					CHAR(64 + (@Year - 2016)) +
					RIGHT(''00'' + CAST(@WeekNo AS VARCHAR), 2) +
					RIGHT(''000'' + CAST(@Seq AS VARCHAR), 3);

			UPDATE ct
				SET ct.TicketNo = @TicketNo
			FROM [' + @DBNAME + '].[dbo].[CallLog_Tickets] ct WITH(NOLOCK)
			WHERE ct.TicketId =  @InsertedId 

			INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Ticket_comments] (
				TicketNo ,Comments ,CreatedBy ,CreatedDate  ,CreatedByName ,CorpId
			) VALUES (
				@TicketNo
				,@Descr
				, @CompanyId
				,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
				,@CustomerName
				,@CorpId
			)

			SELECT  
				1 as stat
				,@TicketNo as WabaMessage
				,1000 as stat_code

		';
		PRINT(@SQL)
		SET @SQL1 = '
				SELECT 
					1 as stat
					,''Ticket Added successfully'' as stat_msg
					,1000 as stat_code
					,ct.TicketId
					,ISNULL(ct.CallLogId,0) AS CallId
					,ct.TicketNo
					,ct.MainSubject
					,ct.Subject AS subject 
					,ct.Descr AS instruction
					,ct.Filepath AS attachment
					,ct.FollowUp AS FollowUp
					,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
					,ct.star
					,ct.TicketCloseTime
					,ISNULL(ct.IsClient, 0) AS IsClient
					,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
					,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
					,ISNULL(ct.IsActive,'''') IsActive
					,ct.SendEmail AS sendMail
					,ISNULL(ct.Keywords,'''') keywords
					,ct.IsSuggested AS isSuggested
					,ISNULL(ct.CreatedByName, '''') AS CreatedBy
					,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
					,ISNULL(ct.ProjectCode, '''') AS companyname
					,ISNULL(ct.CustName,'''') AS username
					,ct.CreatedByCode AS CreatedByCode
					,ISNULL(c.categoryname,'''') category
					,ISNULL(A.AppName,'''') appname
					,ISNULL(s.Name,'''') Status
					,ISNULL(p.Name,'''') Priority
					,ISNULL(REPLACE(
					(
						SELECT 
							cc.CommentId AS id
							,ISNULL(cc.Comments,'''') AS message
							,ISNULL(cc.FilePath,'''') AS attachment
							,cc.isOfficeUseOnly
							,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
							,cc.CreatedByName AS Name
							,cc.CreatedDate AS time
						FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
						WHERE cc.TicketNo = ct.TicketNo
						FOR JSON PATH
					), 
					''\/'', ''/''), 
					'''') AS comments
				FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] AS ct WITH(NOLOCK)
				LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
				LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
				LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
				LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
				WHERE ct.TicketId = @InsertedId
		'
		PRINT(@SQL1)
		EXEC(@SQL+@SQL1)
	END
	ELSE IF(ISNULL(@mode,'')='CREATETICKET')
	BEGIN
			DECLARE @CreatedByCode nvarchar(100) = @DBNAME;

		   SET @SQL ='
	   				DECLARE @InsertedId INT;
					DECLARE @ProjectCode NVARCHAR(100);
				
					DECLARE @CustName NVARCHAR(100);
					DECLARE @CreatedByName NVARCHAR(100);
					DECLARE @UpdatedByName NVARCHAR(100);

					SELECT 
						@CustName = LTRIM(RTRIM(
							ISNULL(CU.firstname, '''') + '' '' + ISNULL(CU.lastname, '''')
						))
					FROM ['+ @DBNAME +'].[dbo].[corp_cust] AS CU WITH(NOLOCK)
					WHERE id = '+convert(nvarchar(255),isnull(@CustId,0)) +';

					IF ' + CONVERT(NVARCHAR(1), ISNULL(@IsClient, 0)) + ' = 1
					BEGIN
						SELECT 
							@CreatedByName = LTRIM(RTRIM(
								ISNULL(cc.firstname, '''') + '' '' + ISNULL(cc.lastname, '''')
							))
						FROM ['+ @DBNAME +'].[dbo].[corp_cust] AS cc WITH(NOLOCK)
						WHERE cc.id = '+convert(nvarchar(255),isnull(@CorpId,0)) +';
					END
					ELSE
					BEGIN
						SELECT
							@CreatedByName = LTRIM(RTRIM(
								ISNULL(CB.firstname, '''') + '' '' +
								CASE WHEN ISNULL(CB.middlename, '''') <> '''' THEN CB.middlename + '' '' ELSE '''' END +
								ISNULL(CB.lastname, '''')
							 ))
						FROM ['+ @DBNAME +'].[dbo].[Usermanagement_systemloginmaster] AS CB WITH(NOLOCK)
						WHERE id = '+convert(nvarchar(255),isnull(@CreatedBy,0)) +';
					END

					SELECT
						@ProjectCode = customercode
					FROM ['+ @DBNAME +'].[dbo].[Usermanagement_systemloginmaster] WITH(NOLOCK)
					WHERE id = '+convert(nvarchar(255),isnull(@ProjectId,0)) +';

					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Tickets]
						   (
							  CallLogid
							 ,CustId
							 ,ProjectId
							 ,CateId  
							 ,AppId
							 ,Subject
							 ,Descr
							 ,FilePath
							 ,CreatedBy
							 ,CreatedDate
							 ,ProjectCode
							 ,CreatedByCode
							 ,IsClient
							 ,CustName
							 ,CreatedByName
							 ,CorpId
						   )
					VALUES ( 
								'+convert(nvarchar(255),isnull(@Calllogid,0)) +'
							 ,  '+convert(nvarchar(255),isnull(@CustId,0)) +'
							 ,  '+convert(nvarchar(255),isnull(@ProjectId,0)) +'
							 ,	'+convert(nvarchar(255),isnull(@CateId,0)) +'
							 ,  '+convert(nvarchar(255),isnull(@AppId,0)) +'
							 ,	'''+convert(nvarchar(max), @Subject)+'''
							 , '''+convert(nvarchar(max), @Descr)+'''
							 , '''+convert(nvarchar(max), @FilePath)+'''
							 ,  '+convert(nvarchar(255),isnull(@CreatedBy,0)) +'
							 ,	ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							 ,	@ProjectCode
							 ,	''' + @CreatedByCode + '''
							 ,	'+convert(nvarchar(255),isnull(@IsClient,0)) +'
							 ,  @CustName
							 ,  @CreatedByName
							 , '+convert(nvarchar(255),isnull(@CorpId,0)) +'
						   )
					
					SET  @InsertedId  = SCOPE_IDENTITY();
					SELECT @InsertedId AS TicketId

					-- Tocket No Generate Logic
					DECLARE @Year INT = YEAR(ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE()));
					DECLARE @WeekNo INT = DATEPART(WEEK, ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE()));
					DECLARE @Seq INT;

					-- Get sequence for current year/week
					SELECT 
						@Seq = ISNULL(MAX(CAST(RIGHT(TicketNo, 3) AS INT)) + 1, 1)
					FROM [' + @DBNAME + '].[dbo].[CallLog_Tickets] WITH (NOLOCK)
					WHERE DATEPART(YEAR, CreatedDate) = @Year
					AND DATEPART(WEEK, CreatedDate) = @WeekNo;

					-- Build TicketNo
					DECLARE @TicketNo NVARCHAR(20) = 
						CHAR(64 + (@Year - 2016)) +
						RIGHT(''00'' + CAST(@WeekNo AS VARCHAR), 2) +
						RIGHT(''000'' + CAST(@Seq AS VARCHAR), 3);

					UPDATE ct
					SET 
						ct.TicketNo = @TicketNo
					FROM [' + @DBNAME + '].[dbo].[CallLog_Tickets] ct WITH(NOLOCK)
					WHERE ct.TicketId =  @InsertedId 

					SET @OutCallLogId = @InsertedId;

					------------- Add Comment ------------------
					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Ticket_comments] 
						  (								
							 TicketNo
							,CallLogId
							,Comments
							,Filepath
							,isOfficeUseOnly
							,Role
							,CreatedBy
							,CreatedDate 
							,CreatedByName
							,CorpId
						  )
					values(
							 @TicketNo
							,  '+convert(nvarchar(255),isnull(@CallLogid,0))+'
							,'''+convert(nvarchar(max), @Descr)+'''
							,'''+convert(nvarchar(max), isnull(@FilePath, '''')) + '''
							, '+convert(nvarchar(255), isnull(@isOfficeUseOnly, 0)) +'
							,  '+convert(nvarchar(255), isnull(@Role, 0)) +'
							,  '+convert(nvarchar(255),isnull(@CreatedBy,0)) +'
							,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							,@CreatedByName
							,' + CONVERT(NVARCHAR(255), ISNULL(@CorpId, 0)) + '
					  )

					IF(' + convert(nvarchar(255), isnull(@CallLogid, 0)) + ' <> 0)
					BEGIN
						UPDATE cl
						SET 
							cl.ExternalStatusID = 3
						FROM [' + @DBNAME + '].[dbo].[CallLog] cl WITH(NOLOCK)
						WHERE cl.CallLogId =  '+convert(nvarchar(255), isnull(@CallLogid,0))+'
					END
				
					SELECT 
						 1 as stat
						,''Ticket Added successfully'' as stat_msg
						,1000 as stat_code
						,ct.TicketId
						,ISNULL(ct.CallLogId,0) AS CallId
						,ct.TicketNo
						,ct.MainSubject
						,ct.Subject AS subject 
						,ct.Descr AS instruction
						,ct.Filepath AS attachment
						,ct.FollowUp AS FollowUp
						,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
						,ct.star
						,ct.TicketCloseTime
						,ISNULL(ct.IsClient, 0) AS IsClient
						,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
						,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
						,ISNULL(ct.IsActive,'''') IsActive
						,ct.SendEmail AS sendMail
						,ISNULL(ct.Keywords,'''') keywords
						,ct.IsSuggested AS isSuggested
						,ISNULL(ct.CreatedByName, '''') AS CreatedBy
						,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
						,ISNULL(ct.ProjectCode, '''') AS companyname
						,ISNULL(ct.CustName,'''') AS username
						,ct.CreatedByCode AS CreatedByCode
						,ISNULL(c.categoryname,'''') category
						,ISNULL(A.AppName,'''') appname
						,ISNULL(s.Name,'''') Status
						,ISNULL(p.Name,'''') Priority
						,ISNULL(REPLACE(
							(
								SELECT 
									cc.CommentId AS id
									,ISNULL(cc.Comments,'''') AS message
									,ISNULL(cc.FilePath,'''') AS attachment
									,cc.isOfficeUseOnly
									,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
									,cc.CreatedByName AS Name
									,cc.CreatedDate AS time
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
								WHERE cc.TicketNo = ct.TicketNo
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS comments
					FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] AS ct WITH(NOLOCK)
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
					LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
					WHERE ct.TicketId = @InsertedId

					IF @InsertedId = 0 or @InsertedId = ''''
					Begin
						SELECT 
				    		 0 as stat
				    		,''The ticket does not create.'' as stat_msg
				    		,1001 as stat_code
					END
					'
				PRINT(@SQL)
				EXEC SP_EXECUTESQL    @SQL,
				N'@CateId NVARCHAR(255), @Subject NVARCHAR(MAX), @Descr NVARCHAR(MAX),
				   @Created_by NVARCHAR(255), @OutCallLogId NVARCHAR(255) OUTPUT'
				 ,@CateId = @CateId
				 ,@Subject = @Subject
				 ,@Descr = @Descr
				 ,@Created_by = @CreatedBy
				 ,@OutCallLogId = @TicketId OUTPUT
 
	END
	ELSE IF(ISNULL(@mode,'')='UPDATETICKET')
	BEGIN

		  SET @SQL = '
				   DECLARE @ErrorMsg NVARCHAR(200) = '''',
						   @DeptName NVARCHAR(MAX) = '''',
						   @IsAdmin BIT = 0,
						   @OldStatusId INT = 0,
						   @TicketCreatedBy INT = 0,
						   @ProjectId INT = 0,
						   @ProjectCode NVARCHAR(MAX) = '''',
						   @CreatedByCode NVARCHAR(255) = '''';

					DECLARE @UpdatedByName NVARCHAR(100);
					SELECT 
						@UpdatedByName = LTRIM(RTRIM(
							ISNULL(CU.firstname, '''') + '' '' +
							CASE WHEN ISNULL(CU.middlename, '''') <> '''' THEN CU.middlename + '' '' ELSE '''' END +
							ISNULL(CU.lastname, '''')
						 )) 
					FROM ['+ @DBNAME +'].[dbo].[Usermanagement_systemloginmaster] AS CU WITH(NOLOCK)
					WHERE id = ' + convert(nvarchar(255), isnull(@CreatedBy, 0)) + ';

				   -- Check if Ticket exists
				   IF NOT EXISTS (SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] WHERE TicketNo = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+''' AND IsActive = 1)
				   BEGIN
					   SET @ErrorMsg += ''TicketNo does not exist.'';
				   END
				   ELSE
				   BEGIN
				
						-- Get values for notification
					   SELECT @OldStatusId = StatusId, @TicketCreatedBy = CreatedBy, @ProjectId = ProjectId, @ProjectCode = ProjectCode, @CreatedByCode = CreatedByCode
					   FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] 
					   WHERE TicketNo = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+''' AND IsActive = 1;


					   SELECT @DeptName = ISNULL(Designationname, '''') 
					   FROM [' + @DBNAME + '].dbo.[Mastermanagement_Designation] WITH (NOLOCK) 
					   WHERE id = ' + convert(nvarchar(255), isnull(@CreatedBy, 0)) + ';
				   END

				   IF LEN(@ErrorMsg) > 0
				   BEGIN
					   SELECT 
						   0 AS stat,
						   @ErrorMsg AS stat_msg,
						   1001 AS stat_code;
					   RETURN;
				   END
			 '
			 SET @SQL1 = '
				   -- Perform the update based on admin/non-admin
				   IF @IsAdmin = 1
				   BEGIN
					  UPDATE ct
                            		SET
                            			 ct.StatusId     = CASE WHEN @StatusId <> 0 THEN @StatusId ELSE ct.StatusId END
                            			,ct.MainSubject  = CASE WHEN ISNULL(@MainSubject, '''') <> '''' THEN @MainSubject ELSE ct.MainSubject END
                            			,ct.IsSuggested  = CASE WHEN @IsSuggested IS NOT NULL THEN @IsSuggested ELSE ct.IsSuggested END
                            			,ct.Star         = CASE WHEN ISNULL(@Star, '''') <> '''' THEN @Star ELSE ct.Star END
                            			,ct.AppId        = CASE WHEN @AppId <> 0 THEN @AppId ELSE ct.AppId END
                            			,ct.CateId       = CASE WHEN @CateId <> 0 THEN @CateId ELSE ct.CateId END
                            			,ct.PriorityId   = CASE WHEN @PriorityId <> 0 THEN @PriorityId ELSE ct.PriorityId END
                            			,ct.FollowUp     = CASE WHEN ISNULL(@FollowUp, '''') <> '''' THEN @FollowUp ELSE ct.FollowUp END
                            			--,ct.Keywords     = CASE WHEN ISNULL(@Keywords, '''') <> '''' THEN @Keywords ELSE ct.Keywords END
                            			,ct.SendEmail    = CASE WHEN ISNULL(@SendEmail,'''') <> '''' THEN @SendEmail ELSE ct.SendEmail END
                            			,ct.PromiseDate  = CASE WHEN ''' + isnull(convert(nvarchar(30), @PromiseDate, 120), '') + ''' <> ''1900-01-01'' THEN ''' + isnull(convert(nvarchar(30), @PromiseDate, 120), '') + ''' 
                            							   ELSE ct.PromiseDate END
                            			,ct.UpdatedBy    = @CreatedBy
										,ct.UpdatedByName= @UpdatedByName
                            			,ct.ModifiedDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
                            		FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] ct WITH(NOLOCK)
                            		WHERE ct.TicketNo = @TicketNo AND ct.IsActive = 1

				   END
				   ELSE
				   BEGIN
					   UPDATE ct
                            		SET
                            			 ct.StatusId     = CASE WHEN @StatusId <> 0 THEN @StatusId ELSE ct.StatusId END
                            			,ct.MainSubject  = CASE WHEN ISNULL(@MainSubject, '''') <> '''' THEN @MainSubject ELSE ct.MainSubject END
                            			,ct.IsSuggested  = CASE WHEN @IsSuggested IS NOT NULL THEN @IsSuggested ELSE ct.IsSuggested END
                            			,ct.Star         = CASE WHEN @Star IS NOT NULL THEN @Star ELSE ct.Star END
                            			,ct.AppId        = CASE WHEN @AppId <> 0 THEN @AppId ELSE ct.AppId END
                            			,ct.CateId       = CASE WHEN @CateId <> 0 THEN @CateId ELSE ct.CateId END
                            			,ct.PriorityId   = CASE WHEN @PriorityId <> 0 THEN @PriorityId ELSE ct.PriorityId END
                            			,ct.FollowUp     = CASE WHEN ISNULL(@FollowUp, '''') <> '''' THEN @FollowUp ELSE ct.FollowUp END
                            			--,ct.Keywords     = CASE WHEN ISNULL(@Keywords, '''') <> '''' THEN @Keywords ELSE ct.Keywords END
                            			,ct.SendEmail    = CASE WHEN @SendEmail IS NOT NULL THEN @SendEmail ELSE ct.SendEmail END
                            			,ct.PromiseDate  = CASE WHEN ''' + isnull(convert(nvarchar(30), @PromiseDate, 120), '') + ''' <> ''1900-01-01'' THEN ''' + isnull(convert(nvarchar(30), @PromiseDate, 120), '') + ''' 
                            							   ELSE ct.PromiseDate END
                            			,ct.UpdatedBy    = @CreatedBy
										,ct.UpdatedByName= @UpdatedByName
                            			,ct.ModifiedDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
                            		FROM [' + @DBNAME + '].[dbo].[CallLog_Tickets] ct WITH(NOLOCK)
                            		WHERE ct.TicketNo = @TicketNo AND ct.IsActive = 1        
				   END
				';

				SET @SQL2 = '
					IF ISNULL(@Keywords, '''') <> ''''
					BEGIN
						DELETE ctk
						FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets_Keyword] ctk
						INNER JOIN ['+@DBNAME+'].[dbo].[CallLog_Tickets] ckt1 WITH(NOLOCK)
							ON ckt1.TicketId = ctk.TicketId
						WHERE ckt1.TicketNo = @TicketNo

						INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Tickets_Keyword]
							(TicketId, EmployeeId, EmployeeName)
						SELECT 
							ckt.TicketId,
							TRY_CONVERT(INT, j.value),
							LTRIM(RTRIM(
								ISNULL(usl.firstname, '''') + '' '' +
								CASE
									WHEN ISNULL(usl.middlename, '''') <> ''''
										THEN usl.middlename + '' ''
									ELSE ''''
								END +
								ISNULL(usl.lastname, '''')
							)) AS EmployeeName
						FROM OPENJSON(@Keywords) j
						INNER JOIN ['+@DBNAME+'].[dbo].[CallLog_Tickets] ckt WITH(NOLOCK)
							ON ckt.TicketNo = @TicketNo
						INNER JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] usl WITH(NOLOCK)
							ON usl.id = TRY_CONVERT(INT, j.value);
					END

				   DECLARE @onesignal_SubPlayid NVARCHAR(MAX),
							@Onesignal_Appid NVARCHAR(255),
							@Onesignal_RestApiKey NVARCHAR(255),
							@StatusName NVARCHAR(255),
							@NotificationContent NVARCHAR(MAX),
							@NotificationHeading NVARCHAR(MAX),
							@AppRegId_Internal INT;	

					IF @OldStatusId <> @StatusId AND @StatusId <> 0
					BEGIN
						SELECT @StatusName = Name FROM [' + @DBNAME + '].dbo.[CallLog_status] WHERE statusId = @StatusId;

						IF @StatusId = 37
						BEGIN
							SET @NotificationHeading = ''Closed tickets'';
							SET @NotificationContent = ''Your issue #'' + @TicketNo + '' is resolved and closed.'';
						END
						ELSE
						BEGIN
							SET @NotificationHeading = ''Ticket Status Changed'';
							SET @NotificationContent = ''Your ticket #'' + @TicketNo + '' status updated to '' + ISNULL(@StatusName, '''') + ''.'';
						END
						
						INSERT INTO ['+@DBNAME+'].[dbo].[CSystem_Notification](
							CompanyCode, CompanyId, FromUserId, Title, Message, Module, EntryDate
						) values (
							@ProjectCode, @ProjectId, @CreatedBy, @NotificationHeading, @NotificationContent, ''ticket'', ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						);

						SELECT @AppRegId_Internal = appid FROM [404146_CentralUser].[dbo].[Appmanagement_AppMaster] WITH(NOLOCK) WHERE appname = ''Optigo Carely'';

						SELECT @Onesignal_Appid = Onesignal_Appid, @Onesignal_RestApiKey = Onesignal_RestApiKey
						FROM [404146_CentralUser].[dbo].[Onesignal_AppDetail] WITH(NOLOCK)
						WHERE Onesignal_AppName = ''Optigo Carely'';

						SELECT @onesignal_SubPlayid = ''['' + STRING_AGG(''"'' + osl.onesignal_SubPlayid + ''"'', '','') + '']''
						FROM [404146_CentralUser].[dbo].[onesignallist] AS osl WITH(NOLOCK)
						INNER JOIN [404146_CentralUser].[dbo].[Appmanagement_Device] AS Ad WITH(NOLOCK)
							ON Ad.SystemLoginId = osl.SystemLoginid AND Ad.DeviceId = osl.deviceid
						WHERE osl.SystemLoginid IN (SELECT id FROM [' + @DBNAME + '].dbo.[corp_cust] WHERE custid = @ProjectId)
						AND Ad.AppId = @AppRegId_Internal
						AND Ad.IsEnable = 1
						AND osl.dbname = @CreatedByCode;
					END
		   '
		   
		   SET @SQL3 = '
					SELECT 
						1 AS stat 
						,''Record updated successfully.'' AS stat_msg 
						,1000 AS stat_code
						,@onesignal_SubPlayid AS Onesignal_SubPlayid
						,@Onesignal_Appid AS Onesignal_Appid
						,@Onesignal_RestApiKey AS Onesignal_RestApiKey
						,''ticket'' AS Module
						,'''+convert(nvarchar(255),@TicketNo)+''' AS TicketNo
						,@NotificationHeading AS Heading
						,@NotificationContent AS Content;

					SELECT 
						ct.TicketId
						,ISNULL(ct.CallLogId,0) AS CallId
						,ct.TicketNo
						,ct.MainSubject
						,ct.Subject AS subject 
						,ct.Descr AS instruction
						,ct.Filepath AS attachment
						,ct.FollowUp AS FollowUp
						,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
						,ct.star
						,ct.TicketCloseTime
						,ISNULL(ct.IsClient, 0) AS IsClient
						,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
						,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
						,ISNULL(ct.IsActive,'''') IsActive
						,ct.SendEmail AS sendMail
						,ISNULL(ct.Keywords,'''') keywords
						,ct.IsSuggested AS isSuggested
						,ISNULL(ct.CreatedByName, '''') AS CreatedBy
						,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
						,ISNULL(ct.ProjectCode, '''') AS companyname
						,ISNULL(ct.CustName,'''') AS username
						,ct.CreatedByCode AS CreatedByCode
						,ISNULL(c.categoryname,'''') category
						,ISNULL(A.AppName,'''') appname
						,ISNULL(s.Name,'''') Status
						,ISNULL(p.Name,'''') Priority
						,ISNULL(REPLACE(
							(
								SELECT 
									cc.CommentId AS id
									,ISNULL(cc.Comments,'''') AS message
									,ISNULL(cc.FilePath,'''') AS attachment
									,cc.isOfficeUseOnly
									,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
									,cc.CreatedByName AS Name
									,cc.CreatedDate AS time
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
								WHERE cc.TicketNo = ct.TicketNo
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS comments
					FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] AS ct WITH(NOLOCK)
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
					LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
					WHERE ct.TicketNo = @TicketNo;
				'

				 PRINT(@SQL);
				 PRINT(@SQL1);
				 PRINT(@SQL2);
				 PRINT(@SQL3);

				 SET @SQL10 = @SQL + @SQL1 + @SQL2 + @SQL3 

				 EXEC SP_EXECUTESQL @SQL10,
				 N'@StatusId INT, @AppId INT, @CateId INT, @IsSuggested BIT, @PriorityId INT,
				   @FollowUp NVARCHAR(MAX), @Keywords NVARCHAR(MAX), @CreatedBy INT,
				   @SendEmail BIT, @TicketNo NVARCHAR(255), @MainSubject NVARCHAR(MAX), 
				   @Star BIT, @PromiseDate NVARCHAR(50)'
				 ,@StatusId     = @StatusId
				 ,@AppId        = @AppId
				 ,@CateId       = @CateId
				 ,@IsSuggested  = @IsSuggested
				 ,@PriorityId   = @PriorityId
				 ,@FollowUp     = @FollowUp
				 ,@Keywords     = @Keywords
				 ,@CreatedBy    = @CreatedBy
				 ,@SendEmail    = @SendEmail
				 ,@TicketNo     = @TicketNo
				 ,@MainSubject  = @MainSubject
				 ,@Star         = @Star
				 ,@PromiseDate  = @PromiseDate;

	END
	ELSE IF(ISNULL(@mode,'')='ADDComment')
	BEGIN

		  SET @SQL ='	
				DECLARE @ErrorMsg NVARCHAR(200) = ''''
				DECLARE @CreatedByName NVARCHAR(200);
				
				IF(' + CONVERT(NVARCHAR(255), ISNULL(@CorpId, 0)) + ' <> 0)
				BEGIN
					SELECT  @CreatedByName = LTRIM(RTRIM(
							ISNULL(cc.firstname, '''') + '' '' + ISNULL(cc.lastname, '''')
					))
					FROM ['+ @DBNAME +'].[dbo].[corp_cust] AS cc WITH(NOLOCK)
					WHERE cc.id = ' + CONVERT(NVARCHAR(255), ISNULL(@CorpId, 0)) + ';
				END
				ELSE
				BEGIN
					SELECT  @CreatedByName = LTRIM(RTRIM(
						ISNULL(CU.firstname, '''') + '' '' +
						CASE WHEN ISNULL(CU.middlename, '''') <> '''' THEN CU.middlename + '' '' ELSE '''' END +
						ISNULL(CU.lastname, '''')
					))
					FROM ['+ @DBNAME +'].[dbo].[Usermanagement_systemloginmaster] AS CU WITH(NOLOCK)
					WHERE id = '+convert(nvarchar(255),isnull(@CreatedBy,0))+';
				END
				IF NOT EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Tickets] WHERE TicketNo = '''+convert(nvarchar(255),isnull(@TicketNo ,''''))+''' AND IsActive = 1)	
				BEGIN
					 SET @ErrorMsg += ''TicketNo does not exists.'';
				END
				IF LEN(@ErrorMsg) > 0
				BEGIN
					SELECT 
						 0 AS stat
						,@ErrorMsg AS stat_msg
						,1001 as stat_code;	  
					RETURN;
				END'

			SET @SQL1 = '
					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Ticket_comments] ( 
						TicketNo ,CallLogId ,Comments ,Filepath ,isOfficeUseOnly
						,Role ,CreatedBy ,CreatedDate ,CreatedByName ,CorpId
					)
					values(
							'''+convert(nvarchar(255),isnull(@TicketNo,''''))+'''
							,  '+convert(nvarchar(255),isnull(@CallLogid,0))+'
							,'''+convert(nvarchar(max), isnull(@Comment, ''''))+'''
							,'''+convert(nvarchar(max), isnull(@FilePath, '''')) + '''
							,  '+convert(nvarchar(255), isnull(@isOfficeUseOnly, 0)) +'
							,  '+convert(nvarchar(255), isnull(@Role, 0)) +'
							,  '+convert(nvarchar(255),isnull(@CreatedBy,0))+'
							,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							,@CreatedByName
							,' + CONVERT(NVARCHAR(255), ISNULL(@CorpId, 0)) + '
					 )
					'
				
			SET @SQL2 = '
					DECLARE @onesignal_SubPlayid NVARCHAR(MAX),
							@Onesignal_Appid NVARCHAR(255),
							@Onesignal_RestApiKey NVARCHAR(255),
							@TicketCreatedBy INT,
							@ProjectId INT,
							@ProjectCode NVARCHAR(MAX),
							@CreatedByCode NVARCHAR(255),
							@NotificationContent NVARCHAR(MAX),
							@AppRegId_Internal INT;

					SELECT @TicketCreatedBy = CreatedBy, @ProjectId = ProjectId, @ProjectCode = ProjectCode, @CreatedByCode = CreatedByCode FROM [' + @DBNAME + '].dbo.[CallLog_Tickets] WHERE TicketNo = ''' + convert(nvarchar(255),isnull(@TicketNo,'''')) + ''';

						SET @NotificationContent = ''A new comment has been added to your ticket #'' + ''' + convert(nvarchar(255),isnull(@TicketNo,'''')) + ''' + '' by '' + ISNULL(@CreatedByName, '''');
						
						INSERT INTO ['+@DBNAME+'].[dbo].[CSystem_Notification](
							CompanyCode, CompanyId, FromUserId, Title, Message, Module, EntryDate
						) values (
							@ProjectCode, @ProjectId, @TicketCreatedBy, ''New Comment'', @NotificationContent, ''ticket'', ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						);

						SELECT @AppRegId_Internal = appid FROM [404146_CentralUser].[dbo].[Appmanagement_AppMaster] WITH(NOLOCK) WHERE appname = ''Optigo Carely'';

						SELECT @Onesignal_Appid = Onesignal_Appid, @Onesignal_RestApiKey = Onesignal_RestApiKey
						FROM [404146_CentralUser].[dbo].[Onesignal_AppDetail] WITH(NOLOCK)
						WHERE Onesignal_AppName = ''Optigo Carely'';

						SELECT @onesignal_SubPlayid = ''['' + STRING_AGG(''"'' + osl.onesignal_SubPlayid + ''"'', '','') + '']''
						FROM [404146_CentralUser].[dbo].[onesignallist] AS osl WITH(NOLOCK)
						INNER JOIN [404146_CentralUser].[dbo].[Appmanagement_Device] AS Ad WITH(NOLOCK)
							ON Ad.SystemLoginId = osl.SystemLoginid AND Ad.DeviceId = osl.deviceid
						WHERE osl.SystemLoginid IN (SELECT id FROM [' + @DBNAME + '].dbo.[corp_cust] WHERE custid = @ProjectId)
						AND Ad.AppId = @AppRegId_Internal
						AND Ad.IsEnable = 1
						AND osl.dbname = @CreatedByCode
						AND osl.SystemLoginId <> ' + CONVERT(NVARCHAR(255), ISNULL(@CorpId, 0)) + ';

				';
				SET @SQL3 = '
			 		SELECT 
						1 as stat
						,''Comment added successfully'' as stat_msg
						,1000 as stat_code
						,@onesignal_SubPlayid AS Onesignal_SubPlayid
						,@Onesignal_Appid AS Onesignal_Appid
						,@Onesignal_RestApiKey AS Onesignal_RestApiKey
						,''New Comment'' AS Heading
						,''ticket'' AS Module
						,''' + convert(nvarchar(255),isnull(@TicketNo,'''')) + ''' AS TicketNo
						,@NotificationContent AS Content

					SELECT 
						ct.TicketId
						,ISNULL(ct.CallLogId,0) AS CallId
						,ct.TicketNo
						,ct.MainSubject
						,ct.Subject AS subject 
						,ct.Descr AS instruction
						,ct.Filepath AS attachment
						,ct.FollowUp AS FollowUp
						,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
						,ct.star
						,ct.TicketCloseTime
						,ISNULL(ct.IsClient, 0) AS IsClient
						,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
						,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
						,ISNULL(ct.IsActive,'''') IsActive
						,ct.SendEmail AS sendMail
						,ISNULL(ct.Keywords,'''') keywords
						,ct.IsSuggested AS isSuggested
						,ISNULL(ct.CreatedByName, '''') AS CreatedBy
						,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
						,ISNULL(ct.ProjectCode, '''') AS companyname
						,ISNULL(ct.CustName,'''') AS username
						,ct.CreatedByCode AS CreatedByCode
						,ISNULL(c.categoryname,'''') category
						,ISNULL(A.AppName,'''') appname
						,ISNULL(s.Name,'''') Status
						,ISNULL(p.Name,'''') Priority
						,ISNULL(REPLACE(
							(
								SELECT 
									cc.CommentId AS id
									,ISNULL(cc.Comments,'''') AS message
									,ISNULL(cc.FilePath,'''') AS attachment
									,cc.isOfficeUseOnly
									,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
									,cc.CreatedByName AS Name
									,cc.CreatedDate AS time
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
								WHERE cc.TicketNo = ct.TicketNo
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS comments
					FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] AS ct WITH(NOLOCK)
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
					LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
					WHERE ct.TicketNo ='''+convert(nvarchar(255),isnull(@TicketNo,''''))+''';
				'
			PRINT(@SQL)
			PRINT(@SQL1)
			PRINT(@SQL2)
			PRINT(@SQL3)
			EXEC( @SQL + @SQL1 + @SQL2 + @SQL3 )
	END
	ELSE IF(ISNULL(@mode,'')='UpdateComment')
	BEGIN
		SET @SQL = '
			
			IF(' + CONVERT(NVARCHAR(255), ISNULL(@CorpId, 0)) + ' <> 0)
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Ticket_comments] As ct1
					WHERE ct1.CommentId = '+convert(nvarchar(255), isnull(@CommentId, 0)) +'
					AND ct1.CorpId = '+convert(nvarchar(255), isnull(@CorpId, 0)) +'
					AND ct1.IsActive = 1
				)
				BEGIN
					SELECT 
						0 as stat
						,''You Are Not Allow Edit Comment'' as stat_msg
						,1001 as stat_code
					RETURN;
				END
			END
			ELSE IF (' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ' <> 0)
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Ticket_comments] As ct2
					WHERE ct2.CommentId = '+convert(nvarchar(255), isnull(@CommentId, 0)) +'
					AND ct2.CreatedBy = '+convert(nvarchar(255), isnull(@CreatedBy, 0)) +'
					AND ct2.IsActive = 1
				)
				BEGIN
					SELECT 
						0 as stat
						,''You Are Not Allow Edit Comment'' as stat_msg
						,1001 as stat_code;
					RETURN;
				END
			END

			IF EXISTS (
				SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Ticket_comments] As ct1
				WHERE ct1.CommentId = '+convert(nvarchar(255), isnull(@CommentId, 0)) +'
				AND DATEDIFF(HOUR, ct1.CreatedDate, 
				  ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
				) <= 24
			)
			BEGIN
				UPDATE ctc
					SET ctc.Comments = '''+convert(nvarchar(max), isnull(@Comment, ''''))+'''
					,ctc.Filepath = '''+convert(nvarchar(max), isnull(@FilePath, '''')) + '''
					,ctc.isOfficeUseOnly = '+convert(nvarchar(255), isnull(@isOfficeUseOnly, 0)) +'
					,ctc.ModifiedDate= ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
				FROM ['+@DBNAME+'].[dbo].[CallLog_Ticket_comments]  ctc WITH(NOLOCK)
				WHERE ctc.CommentId = '+convert(nvarchar(255), isnull(@CommentId, 0)) +'

				SELECT 
					1 as stat
					,''Comment update successfully'' as stat_msg
					,1000 as stat_code

					SELECT 
						ct.TicketId
						,ISNULL(ct.CallLogId,0) AS CallId
						,ct.TicketNo
						,ct.MainSubject
						,ct.Subject AS subject 
						,ct.Descr AS instruction
						,ct.Filepath AS attachment
						,ct.FollowUp AS FollowUp
						,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
						,ct.star
						,ct.TicketCloseTime
						,ISNULL(ct.IsClient, 0) AS IsClient
						,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
						,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
						,ISNULL(ct.IsActive,'''') IsActive
						,ct.SendEmail AS sendMail
						,ISNULL(ct.Keywords,'''') keywords
						,ct.IsSuggested AS isSuggested
						,ISNULL(ct.CreatedByName, '''') AS CreatedBy
						,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
						,ISNULL(ct.ProjectCode, '''') AS companyname
						,ISNULL(ct.CustName,'''') AS username
						,ct.CreatedByCode AS CreatedByCode
						,ISNULL(c.categoryname,'''') category
						,ISNULL(A.AppName,'''') appname
						,ISNULL(s.Name,'''') Status
						,ISNULL(p.Name,'''') Priority
						,ISNULL(REPLACE(
							(
								SELECT 
									cc.CommentId AS id
									,ISNULL(cc.Comments,'''') AS message
									,ISNULL(cc.FilePath,'''') AS attachment
									,cc.isOfficeUseOnly
									,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
									,cc.CreatedByName AS Name
									,cc.CreatedDate AS time
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
								WHERE cc.TicketNo = ct.TicketNo
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS comments
					FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] AS ct WITH(NOLOCK)
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
					LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
					LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
					WHERE ct.TicketNo ='''+convert(nvarchar(255),isnull(@TicketNo,''''))+''';
			END
			ELSE
			BEGIN
				SELECT 
					0 as stat
					,''Comment can only be edited within 24 hours'' as stat_msg
					,1001 as stat_code
			END
		';
		PRINT(@SQL) 
		EXEC(@SQL) 
	END
	ELSE IF(ISNULL(@mode,'')='TICKETDATA')
	BEGIN
	
		SET @SQL1 ='
				DECLARE @TicketId int = '+CONVERT(nvarchar(10), ISNULL(@TicketId, 0))+';

				SELECT 
					ct.TicketId
					,ISNULL(ct.CallLogId,0) AS CallId
					,ct.TicketNo
					,ct.MainSubject
					,ct.Subject AS subject 
					,ct.Descr AS instruction
					,ct.Filepath AS attachment
					,ct.FollowUp AS FollowUp
					,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
					,ct.star
					,ct.TicketCloseTime
					,ISNULL(ct.IsClient, 0) AS IsClient
					,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
					,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
					,ISNULL(ct.IsActive,'''') IsActive
					,ct.SendEmail AS sendMail
					--,ISNULL(ct.Keywords,'''') keywords
					,ct.IsSuggested AS isSuggested
					,ISNULL(ct.CreatedByName, '''') AS CreatedBy
					,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
					,ISNULL(ct.ProjectCode, '''') AS companyname
					,ISNULL(ct.CustName,'''') AS username
					,ISNULL(dd.ID, 0) AS OrderId
					,ISNULL(CONVERT(VARCHAR, dd.EntryDate, 120), '''') AS Order_CreatedDate
		'
		SET @SQL2 = '
					,CASE 
						WHEN DATEDIFF(MINUTE, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 60 THEN 
							CAST(DATEDIFF(MINUTE, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Min''
						WHEN DATEDIFF(HOUR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 24 THEN 
							CAST(DATEDIFF(HOUR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Hour''
						WHEN DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 7 THEN 
							CAST(DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Day''
						WHEN DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 30 THEN 
							CAST(DATEDIFF(WEEK, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Week''
						WHEN DATEDIFF(MONTH, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 12 THEN 
							CAST(DATEDIFF(MONTH, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' MONTH''
						ELSE 
							CAST(DATEDIFF(YEAR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Year''
						END AS Age
					,CASE 
						WHEN ct.ModifiedDate IS NULL THEN ''Not Updated''
						WHEN DATEDIFF(MINUTE, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 60 THEN 
							CAST(DATEDIFF(MINUTE, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Min''
						WHEN DATEDIFF(HOUR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 24 THEN 
							CAST(DATEDIFF(HOUR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Hour''
						WHEN DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 7 THEN 
							CAST(DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Day''
						WHEN DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 30 THEN 
							CAST(DATEDIFF(WEEK, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Week''
						WHEN DATEDIFF(MONTH, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 12 THEN 
							CAST(DATEDIFF(MONTH, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' MONTH''
						ELSE 
							CAST(DATEDIFF(YEAR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Year''
						END AS UpdatedAge
		'

		SET @SQL3 ='
						,ISNULL(REPLACE(
							(
								SELECT 
									cc.CommentId AS id
									,ISNULL(cc.Comments,'''') AS message
									,ISNULL(cc.FilePath,'''') AS attachment
									,cc.isOfficeUseOnly
									,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
									,cc.CreatedByName AS Name
									,cc.CreatedDate AS time
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
								WHERE cc.TicketNo = ct.TicketNo 
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS comments
						,ISNULL(REPLACE(
							(
								SELECT 
									ctr.Id
									,ctr.TicketNo
									,ctr.RatingValue
									,ctr.RatingDescription
									,ctr.RatingBy
									,ctr.EntryDate
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_Rating] ctr WITH (NOLOCK)
								WHERE ctr.TicketNo = ct.TicketNo
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS Rating
						,ISNULL(REPLACE(
							(
								SELECT 
									ctk.EmployeeId
									,ctk.EmployeeName
								FROM [' + @DBNAME + '].dbo.[CallLog_Tickets_Keyword] ctk WITH (NOLOCK)
								WHERE ctk.TicketId = ct.TicketId
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS Keywords
			'
		SET @SQL4 = '
							,ISNULL(c.categoryname,'''') category
							,ISNULL(A.AppName,'''') appname
							,ISNULL(s.Name,'''') Status
							,ISNULL(p.Name,'''') Priority
							,ct.CreatedByCode AS CreatedByCode
						FROM  [' + @DBNAME + '].dbo.[CallLog_Tickets] AS ct WITH (NOLOCK)
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
						LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
						LEFT JOIN  [' + @DBNAME + '].dbo.[PointToBeDiscuss] dd WITH(NOLOCK) ON ct.TicketId = dd.TicketId
						WHERE (
								@TicketId = 0 
								OR ct.TicketId = @TicketId
						);
			'

		PRINT(@SQL1)
		PRINT(@SQL2)
		PRINT(@SQL3)
		PRINT(@SQL4)
		EXEC(@SQL1+@SQL2+@SQL3+@SQL4)
	END
	ELSE IF(ISNULL(@mode,'')='TICKETDATANew')
	BEGIN
	
		SET @SQL1 ='
				DECLARE @Now DATETIME = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE()),
						@TicketId int = '+CONVERT(nvarchar(10), ISNULL(@TicketId, 0))+';

				SELECT
					cc.TicketNo,
					Comments =
						REPLACE(
							(
								SELECT
									c.CommentId AS id,
									ISNULL(c.Comments, '''') AS message,
									ISNULL(c.FilePath, '''') AS attachment,
									c.isOfficeUseOnly,
									CASE WHEN ISNULL(c.Role, 0) = 1 THEN ''Admin'' ELSE ''Client'' END AS Role,
									c.CreatedByName AS Name,
									c.CreatedDate AS time
								FROM ['+@DBNAME+'].dbo.CallLog_Ticket_comments AS c WITH (NOLOCK)
								WHERE c.TicketNo = cc.TicketNo
								ORDER BY c.CreatedDate
								FOR JSON PATH
							),
							''\/'',
							''/''
						)
				INTO #Comments
				FROM ['+@DBNAME+'].dbo.CallLog_Ticket_comments AS cc WITH (NOLOCK)
				GROUP BY cc.TicketNo;

				SELECT
					ctr.TicketNo,
					Rating =
						REPLACE(
							(
								SELECT
									r.Id,
									r.TicketNo,
									r.RatingValue,
									r.RatingDescription,
									r.RatingBy,
									r.EntryDate
								FROM ['+@DBNAME+'].dbo.CallLog_Ticket_Rating AS r WITH (NOLOCK)
								WHERE r.TicketNo = ctr.TicketNo
								ORDER BY r.EntryDate
								FOR JSON PATH
							),
							''\/'',
							''/''
						)
				INTO #Rating
				FROM ['+@DBNAME+'].dbo.CallLog_Ticket_Rating AS ctr WITH (NOLOCK)
				GROUP BY ctr.TicketNo;

				SELECT
					ctk.TicketId,
					Keywords =
						REPLACE(
							(
								SELECT
									k.EmployeeId,
									k.EmployeeName
								FROM ['+@DBNAME+'].dbo.CallLog_Tickets_Keyword AS k WITH (NOLOCK)
								WHERE k.TicketId = ctk.TicketId
								FOR JSON PATH
							),
							''\/'',
							''/''
						)
				INTO #Keywords
				FROM ['+@DBNAME+'].dbo.CallLog_Tickets_Keyword AS ctk WITH (NOLOCK)
				GROUP BY ctk.TicketId;

				SELECT 
					ct.TicketId
					,ISNULL(ct.CallLogId,0) AS CallId
					,ct.TicketNo
					,ct.MainSubject
					,ct.Subject AS subject 
					,ct.Descr AS instruction
					,ct.Filepath AS attachment
					,ct.FollowUp AS FollowUp
					,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
					,ct.star
					,ct.TicketCloseTime
					,ISNULL(ct.IsClient, 0) AS IsClient
					,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
					,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
					,ISNULL(ct.IsActive,'''') IsActive
					,ct.SendEmail AS sendMail
					--,ISNULL(ct.Keywords,'''') keywords
					,ct.IsSuggested AS isSuggested
					,ISNULL(ct.CreatedByName, '''') AS CreatedBy
					,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
					,ISNULL(ct.ProjectCode, '''') AS companyname
					,ISNULL(ct.CustName,'''') AS username
					,ISNULL(dd.ID, 0) AS OrderId
					,ISNULL(CONVERT(VARCHAR, dd.EntryDate, 120), '''') AS Order_CreatedDate
			';
			SET @SQL2 = '
					,CASE 
						WHEN DATEDIFF(MINUTE, ct.CreatedDate, @Now) < 60 THEN 
							CAST(DATEDIFF(MINUTE, ct.CreatedDate, @Now) AS VARCHAR) + '' Min''
						WHEN DATEDIFF(HOUR, ct.CreatedDate, @Now) < 24 THEN 
							CAST(DATEDIFF(HOUR, ct.CreatedDate, @Now) AS VARCHAR) + '' Hour''
						WHEN DATEDIFF(DAY, ct.CreatedDate, @Now) < 7 THEN 
							CAST(DATEDIFF(DAY, ct.CreatedDate, @Now) AS VARCHAR) + '' Day''
						WHEN DATEDIFF(DAY, ct.CreatedDate, @Now) < 30 THEN 
							CAST(DATEDIFF(WEEK, ct.CreatedDate, @Now) AS VARCHAR) + '' Week''
						WHEN DATEDIFF(MONTH, ct.CreatedDate, @Now) < 12 THEN 
							CAST(DATEDIFF(MONTH, ct.CreatedDate, @Now) AS VARCHAR) + '' MONTH''
						ELSE 
							CAST(DATEDIFF(YEAR, ct.CreatedDate, @Now) AS VARCHAR) + '' Year''
						END AS Age
					,CASE 
						WHEN ct.ModifiedDate IS NULL THEN ''Not Updated''
						WHEN DATEDIFF(MINUTE, ct.ModifiedDate, @Now) < 60 THEN 
							CAST(DATEDIFF(MINUTE, ct.ModifiedDate, @Now) AS VARCHAR(50)) + '' Min''
						WHEN DATEDIFF(HOUR, ct.ModifiedDate, @Now) < 24 THEN 
							CAST(DATEDIFF(HOUR, ct.ModifiedDate, @Now) AS VARCHAR(50)) + '' Hour''
						WHEN DATEDIFF(DAY, ct.ModifiedDate, @Now) < 7 THEN 
							CAST(DATEDIFF(DAY, ct.ModifiedDate, @Now) AS VARCHAR(50)) + '' Day''
						WHEN DATEDIFF(DAY, ct.ModifiedDate, @Now) < 30 THEN 
							CAST(DATEDIFF(WEEK, ct.ModifiedDate, @Now) AS VARCHAR(50)) + '' Week''
						WHEN DATEDIFF(MONTH, ct.ModifiedDate, @Now) < 12 THEN 
							CAST(DATEDIFF(MONTH, ct.ModifiedDate, @Now) AS VARCHAR(50)) + '' MONTH''
						ELSE 
							CAST(DATEDIFF(YEAR, ct.ModifiedDate, @Now) AS VARCHAR(50)) + '' Year''
						END AS UpdatedAge
					,ISNULL(cm.Comments, '''') AS comments
					,ISNULL(rt.Rating, '''') AS Rating
					,ISNULL(kw.Keywords, '''') AS Keywords
					,ISNULL(c.categoryname,'''') category
					,ISNULL(A.AppName,'''') appname
					,ISNULL(s.Name,'''') Status
					,ISNULL(p.Name,'''') Priority
					,ct.CreatedByCode AS CreatedByCode
				FROM  [' + @DBNAME + '].dbo.[CallLog_Tickets] AS ct WITH (NOLOCK)
				LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
				LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
				LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
				LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
				LEFT JOIN  [' + @DBNAME + '].dbo.[PointToBeDiscuss] dd WITH(NOLOCK) ON ct.TicketId = dd.TicketId
				LEFT JOIN #Comments AS cm ON cm.TicketNo = ct.TicketNo
				LEFT JOIN #Rating AS rt ON rt.TicketNo = ct.TicketNo
				LEFT JOIN #Keywords AS kw ON kw.TicketId = ct.TicketId;
				WHERE (
					@TicketId = 0 
					OR ct.TicketId = @TicketId
				)

				DROP TABLE IF EXISTS #Comments;
				DROP TABLE IF EXISTS #Rating;
				DROP TABLE IF EXISTS #Keywords;
			'

		PRINT(@SQL1)
		PRINT(@SQL2)
		EXEC(@SQL1+@SQL2)
	END
	ELSE IF(ISNULL(@mode,'')='TICKETDATA_CUST')
	BEGIN
	
		SET @SQL1 ='
				declare @custid as int=isnull((
					select custid from ['+@DBNAME+'].dbo.corp_cust with (nolock) 
					where userid='''+@appuserid+'''
				),0)

				SELECT 
					ct.TicketId
					,ISNULL(ct.CallLogId,0) AS CallId
					,ct.TicketNo
					,ct.MainSubject
					,ct.Subject AS subject 
					,ct.Descr AS instruction
					,ct.Filepath AS attachment
					,ct.FollowUp AS FollowUp
					,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
					,ct.star
					,ct.TicketCloseTime
					,ISNULL(ct.IsClient, 0) AS IsClient
					,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
					,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
					,ISNULL(ct.IsActive,'''') IsActive
					,ct.SendEmail AS sendMail
					--,ISNULL(ct.Keywords,'''') keywords
					,ct.IsSuggested AS isSuggested
					,ISNULL(ct.CreatedByName, '''') AS CreatedBy
					,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
					,ISNULL(ct.ProjectCode, '''') AS companyname
					,ISNULL(ct.CustName,'''') AS username
					,ISNULL(dd.ID, 0) AS OrderId
					,ISNULL(CONVERT(VARCHAR, dd.EntryDate, 120), '''') AS Order_CreatedDate
		'
		SET @SQL2 = '
					,CASE 
						WHEN DATEDIFF(MINUTE, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 60 THEN 
							CAST(DATEDIFF(MINUTE, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Min''
						WHEN DATEDIFF(HOUR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 24 THEN 
							CAST(DATEDIFF(HOUR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Hour''
						WHEN DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 7 THEN 
							CAST(DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Day''
						WHEN DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 30 THEN 
							CAST(DATEDIFF(WEEK, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Week''
						WHEN DATEDIFF(MONTH, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 12 THEN 
							CAST(DATEDIFF(MONTH, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' MONTH''
						ELSE 
							CAST(DATEDIFF(YEAR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Year''
						END AS Age
					,CASE 
						WHEN ct.ModifiedDate IS NULL THEN ''Not Updated''
						WHEN DATEDIFF(MINUTE, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 60 THEN 
							CAST(DATEDIFF(MINUTE, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Min''
						WHEN DATEDIFF(HOUR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 24 THEN 
							CAST(DATEDIFF(HOUR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Hour''
						WHEN DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 7 THEN 
							CAST(DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Day''
						WHEN DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 30 THEN 
							CAST(DATEDIFF(WEEK, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Week''
						WHEN DATEDIFF(MONTH, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 12 THEN 
							CAST(DATEDIFF(MONTH, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' MONTH''
						ELSE 
							CAST(DATEDIFF(YEAR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Year''
						END AS UpdatedAge
		'

		SET @SQL3 ='
						,ISNULL(REPLACE(
							(
								SELECT 
									cc.CommentId AS id
									,ISNULL(cc.Comments,'''') AS message
									,ISNULL(cc.FilePath,'''') AS attachment
									,cc.isOfficeUseOnly
									,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
									,cc.CreatedByName AS Name
									,cc.CreatedDate AS time
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
								WHERE cc.TicketNo = ct.TicketNo 
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS comments
						,ISNULL(REPLACE(
							(
								SELECT 
									ctr.Id
									,ctr.TicketNo
									,ctr.RatingValue
									,ctr.RatingDescription
									,ctr.RatingBy
									,ctr.EntryDate
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_Rating] ctr WITH (NOLOCK)
								WHERE ctr.TicketNo = ct.TicketNo
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS Rating
						,ISNULL(REPLACE(
								(
									SELECT 
										ctk.EmployeeId
										,ctk.EmployeeName
									FROM [' + @DBNAME + '].dbo.[CallLog_Tickets_Keyword] ctk WITH (NOLOCK)
									WHERE ctk.TicketId = ct.TicketId
									FOR JSON PATH
								), 
							''\/'', ''/''), 
						'''') AS Keywords
			'
		SET @SQL4 = '
							,ISNULL(c.categoryname,'''') category
							,ISNULL(A.AppName,'''') appname
							,ISNULL(s.Name,'''') Status
							,ISNULL(p.Name,'''') Priority
							,ct.CreatedByCode AS CreatedByCode
						FROM  [' + @DBNAME + '].dbo.[CallLog_Tickets] AS ct WITH (NOLOCK)
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
						LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
						LEFT JOIN  [' + @DBNAME + '].dbo.[PointToBeDiscuss] dd WITH(NOLOCK) ON ct.TicketId = dd.TicketId
						WHERE ISNULL(ct.ProjectID,0)=@custid
						AND ISNULL(ct.ProjectID,0)>0
			'

		PRINT(@SQL1)
		PRINT(@SQL2)
		PRINT(@SQL3)
		PRINT(@SQL4)
		EXEC(@SQL1+@SQL2+@SQL3+@SQL4)
	END
	ELSE IF(ISNULL(@mode,'')='TICKETDATA_WEB')
	BEGIN
	
		SET @SQL1 ='
				declare @custid as int=isnull((
					select custid from ['+@DBNAME+'].dbo.corp_cust with (nolock) 
					where userid='''+@appuserid+'''
				),0)

				SELECT 
					ct.TicketId
					,ISNULL(ct.CallLogId,0) AS CallId
					,ct.TicketNo
					,ct.MainSubject
					,ct.Subject AS subject 
					,ct.Descr AS instruction
					,ct.Filepath AS attachment
					,ct.FollowUp AS FollowUp
					,ISNULL(CONVERT(VARCHAR, ct.PromiseDate, 120), '''') AS PromiseDate
					,ct.star
					,ct.TicketCloseTime
					,ISNULL(ct.IsClient, 0) AS IsClient
					,ISNULL(CONVERT(VARCHAR(MAX), ct.CreatedDate, 120), '''') AS CreatedOn
					,ISNULL(CONVERT(VARCHAR, ct.ModifiedDate, 120), '''') AS UpdatedAt 
					,ISNULL(ct.IsActive,'''') IsActive
					,ct.SendEmail AS sendMail
					--,ISNULL(ct.Keywords,'''') keywords
					,ct.IsSuggested AS isSuggested
					,ISNULL(ct.CreatedByName, '''') AS CreatedBy
					,ISNULL(ct.UpdatedByName, '''') AS LastUpdatedBy
					,ISNULL(ct.ProjectCode, '''') AS companyname
					,ISNULL(ct.CustName,'''') AS username
					,ISNULL(dd.ID, 0) AS OrderId
					,ISNULL(CONVERT(VARCHAR, dd.EntryDate, 120), '''') AS Order_CreatedDate
		'
		SET @SQL2 = '
					,CASE 
						WHEN DATEDIFF(MINUTE, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 60 THEN 
							CAST(DATEDIFF(MINUTE, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Min''
						WHEN DATEDIFF(HOUR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 24 THEN 
							CAST(DATEDIFF(HOUR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Hour''
						WHEN DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 7 THEN 
							CAST(DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Day''
						WHEN DATEDIFF(DAY, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 30 THEN 
							CAST(DATEDIFF(WEEK, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Week''
						WHEN DATEDIFF(MONTH, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 12 THEN 
							CAST(DATEDIFF(MONTH, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' MONTH''
						ELSE 
							CAST(DATEDIFF(YEAR, ct.CreatedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR) + '' Year''
						END AS Age
					,CASE 
						WHEN ct.ModifiedDate IS NULL THEN ''Not Updated''
						WHEN DATEDIFF(MINUTE, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 60 THEN 
							CAST(DATEDIFF(MINUTE, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Min''
						WHEN DATEDIFF(HOUR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 24 THEN 
							CAST(DATEDIFF(HOUR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Hour''
						WHEN DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 7 THEN 
							CAST(DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Day''
						WHEN DATEDIFF(DAY, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 30 THEN 
							CAST(DATEDIFF(WEEK, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Week''
						WHEN DATEDIFF(MONTH, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) < 12 THEN 
							CAST(DATEDIFF(MONTH, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' MONTH''
						ELSE 
							CAST(DATEDIFF(YEAR, ct.ModifiedDate, ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())) AS VARCHAR(50)) + '' Year''
						END AS UpdatedAge
		'

		SET @SQL3 ='
						,ISNULL(REPLACE(
							(
								SELECT 
									cc.CommentId AS id
									,ISNULL(cc.Comments,'''') AS message
									,ISNULL(cc.FilePath,'''') AS attachment
									,cc.isOfficeUseOnly
									,case when ISNULL(cc.Role,0) = 1 then ''Admin'' Else ''Client'' END as Role
									,cc.CreatedByName AS Name
									,cc.CreatedDate AS time
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_comments] cc WITH (NOLOCK)
								WHERE cc.TicketNo = ct.TicketNo 
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS comments
						,ISNULL(REPLACE(
							(
								SELECT 
									ctr.Id
									,ctr.TicketNo
									,ctr.RatingValue
									,ctr.RatingDescription
									,ctr.RatingBy
									,ctr.EntryDate
								FROM [' + @DBNAME + '].dbo.[CallLog_Ticket_Rating] ctr WITH (NOLOCK)
								WHERE ctr.TicketNo = ct.TicketNo
								FOR JSON PATH
							), 
						''\/'', ''/''), 
						'''') AS Rating
			'
		SET @SQL4 = '
							,ISNULL(c.categoryname,'''') category
							,ISNULL(A.AppName,'''') appname
							,ISNULL(s.Name,'''') Status
							,ISNULL(p.Name,'''') Priority
							,ct.CreatedByCode AS CreatedByCode
						FROM  [' + @DBNAME + '].dbo.[CallLog_Tickets] AS ct WITH (NOLOCK)
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_category] c WITH(NOLOCK) ON ct.CateId = c.CateId
						LEFT JOIN  ['+ @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK) ON ct.AppId = A.AppId
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_status] s WITH(NOLOCK) ON ct.statusId = s.statusId
						LEFT JOIN  [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK) ON ct.PriorityId = p.PriorityId
						LEFT JOIN  [' + @DBNAME + '].dbo.[PointToBeDiscuss] dd WITH(NOLOCK) ON ct.TicketId = dd.TicketId
						WHERE ISNULL(ct.ProjectID,0)=@custid
						AND ISNULL(ct.ProjectID,0)>0
			'
		IF(@ApiStatus = 'New')
		BEGIN
			SET @SQl4 += '
				AND ct.ModifiedDate IS NULL
			';
		END
		ELSE IF(@ApiStatus = 'Open')
		BEGIN
			SET @SQl4 += '
				AND ct.statusId NOT IN (37,12)
				AND ISNULL(ct.ModifiedDate, '''') <> ''''
			';
		END
		ELSE IF(@ApiStatus = 'Close')
		BEGIN
			SET @SQl4 += '
				AND ct.statusId = 37
			';
		END

		IF (@ApiStatus <> 'Close' AND ISNULL(@StatusId, 0) <> 0)
		BEGIN
			SET @SQL4 += '
				AND ct.statusId = ' + convert(nvarchar(255), @StatusId) + '
			'
		END

		IF(ISNULL(@PriorityId, 0) <> 0)
		BEGIN
			SET @SQL4 += '
				AND ct.PriorityId = ' + convert(nvarchar(255), @PriorityId) + '
			'
		END

		IF(ISNULL(@StartDate, '') <> '' AND ISNULL(@EndDate, '') <> '')
		BEGIN
			SET @SQL4 += '
				AND ct.CreatedDate BETWEEN 
						''' + convert(NVARCHAR(100), @StartDate) + ' 00:00:00'' AND 
						''' + convert(NVARCHAR(100), @EndDate) + ' 23:59:59''
			';
		END
		
		IF(ISNULL(@SearchTerm, '') <> '')
		BEGIN
			SET @SQL4 += '
				AND (
					ct.TicketNo LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR ct.Subject LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR ct.MainSubject LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR ct.Descr LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR ct.FollowUp LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR ct.Keywords LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR ct.CustName LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR A.AppName LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR s.Name LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR c.categoryname LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR p.Name LIKE ''%' + convert(nvarchar(MAX), @SearchTerm) + '%''
					OR EXISTS (
						SELECT 1 
						FROM [' + @DBNAME + '].[dbo].[CallLog_Ticket_comments] cm WITH(NOLOCK)
						WHERE cm.TicketNo = ct.TicketNo
						AND cm.Comments LIKE ''%' + CONVERT(NVARCHAR(MAX), @SearchTerm) + '%''
					)
					OR EXISTS (
						SELECT 1 
						FROM [' + @DBNAME + '].[dbo].[CallLog_Ticket_Rating] r WITH(NOLOCK)
						WHERE r.TicketNo = ct.TicketNo
						AND (
							r.RatingValue LIKE ''%' + CONVERT(NVARCHAR(MAX), @SearchTerm) + '%'' 
							OR r.RatingDescription LIKE ''%' + CONVERT(NVARCHAR(MAX), @SearchTerm) + '%''
						)
					)
				)
			';
		END

		SET @SQL4 += '
				ORDER BY ct.TicketId DESC
				OFFSET ((' + LTRIM(RTRIM(STR(@Page))) + ' - 1) * ' + LTRIM(RTRIM(STR(@PageSize))) + ') ROWS
				FETCH NEXT ' + LTRIM(RTRIM(STR(@PageSize))) + ' ROWS ONLY;

				SELECT COUNT(cti.TicketId) FROM  [' + @DBNAME + '].dbo.[CallLog_Tickets] cti WITH (NOLOCK)
				WHERE ISNULL(cti.ProjectID,0)=@custid
				AND (
					''' + @ApiStatus + ''' <> ''New''
					OR cti.ModifiedDate IS NULL
				)
				AND (
					''' + @ApiStatus + ''' <> ''Close''
					OR cti.statusId = 37
				)
				AND (
					''' + @ApiStatus + ''' <> ''Open''
					OR (
						cti.statusId NOT IN (37,12)
						AND ISNULL(cti.ModifiedDate, '''') <> ''''
					)
				)
				AND (
					''' + @StartDate +''' = '''' AND ''' + @EndDate + ''' = ''''
					OR (
						cti.CreatedDate BETWEEN 
							''' + convert(NVARCHAR(100), @StartDate) + ' 00:00:00'' AND 
							''' + convert(NVARCHAR(100), @EndDate) + ' 23:59:59''
					)
				);
				

		';

		PRINT(@SQL1)
		PRINT(@SQL2)
		PRINT(@SQL3)
		PRINT(@SQL4)
		EXEC(@SQL1+@SQL2+@SQL3+@SQL4)
	END
	ELSE IF(ISNULL(@mode,'')='ADDPROJECT')
	BEGIN       
			 SET @SQL ='	
		 			  DECLARE @ErrorMsg NVARCHAR(200) = ''''
				  
					  IF EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Projects] WHERE RTRIM(LTRIM(Projectname)) = '''+convert(nvarchar(255),isnull(RTRIM(LTRIM(@Projectname)),0))+''' )
						  SET @ErrorMsg += ''Project Name already exists.'';
                  
					  IF LEN(@ErrorMsg) > 0
					  BEGIN
						  SELECT
							   0 AS stat 
							  ,@ErrorMsg AS stat_msg
							  ,1001 AS stat_code;
							
						  RETURN;
					  END
                  
					  INSERT INTO  ['+@DBNAME+'].[dbo].[CallLog_Projects] 
							(
							 Projectcode
							,Projectname
							)
					  VALUES(
							 '''+convert(nvarchar(255),isnull(RTRIM(LTRIM(@Projectcode)),0))+'''
							,'''+convert(nvarchar(255),isnull(RTRIM(LTRIM(@Projectname)),0))+'''
							);
                  
					  SELECT 1 AS Success, ''Project inserted successfully.'' AS Message;'
			 			     				
				PRINT(@SQL)
				EXEC(@SQL)
 
	END
	ELSE IF(ISNULL(@mode,'')='NEWCUSTOMER')
	BEGIN

		SET @SQL = '

			 IF EXISTS (SELECT 1 FROM [' + @DBNAME + '].[dbo].[CallLog_Customer_Data] WITH(NOLOCK) WHERE Code = ''' + convert(nvarchar(255), isnull(@Code, '''')) + ''')
			 BEGIN
				  SELECT 
					 0 AS stat
					,''Code already exists.'' AS stat_msg
					,1001 AS stat_code;
			 END
			 ELSE
			 BEGIN
				 INSERT INTO [' + @DBNAME + '].[dbo].[CallLog_Customer_Data] 
					   (
						  CreatedBy
						 ,Code
						 ,ProjectId
						 ,FirstName
						 ,MiddleName
						 ,LastName
						 ,Address
						 ,MobileNo
						 ,EmailId
						 ,Salary
						 ,FilePath
					   )
				 VALUES(
						  ' + convert(nvarchar(255), isnull(@CreatedBy, 0)) + '
						 , ''' + convert(nvarchar(255), isnull(@Code, '''')) + '''
						 , ''' + convert(nvarchar(255), isnull(@Projectcode, '''')) + '''
						 ,''' + REPLACE(convert(nvarchar(255), isnull(RTRIM(LTRIM(@FirstName)), '')), '''', '''''') + '''   
						 , ''' + REPLACE(convert(nvarchar(255), isnull(RTRIM(LTRIM(@MiddleName)), '')), '''', '''''') + '''   
						 , ''' + REPLACE(convert(nvarchar(255), isnull(RTRIM(LTRIM(@LastName)), '')), '''', '''''') + '''   
						 , ''' + convert(nvarchar(255), isnull(@Address, '''')) + '''
						 , ' + convert(nvarchar(255), isnull(@MobileNo, 0)) + '
						 , ''' + convert(nvarchar(255), isnull(@EmailId, '''')) + '''
						 , ' + convert(nvarchar(255), isnull(@Salary, 0)) + '
						 ,''' + convert(nvarchar(max), isnull(@FilePath, '''')) + '''
					   );
	 
				 SELECT 
					  1 AS stat
					 ,''New customer data added successfully.'' AS stat_msg
					 ,1000 AS stat_code;
			 END
		';


		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF(ISNULL(@mode,'')='NEWCATEGORY')
	BEGIN
		  SET @SQL ='	
		 			DECLARE @ErrorMsg NVARCHAR(200) = ''''
					  IF EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Category] with(Nolock) WHERE ISNULL(Code,'''') = '''+convert(NVARCHAR(255),ISNULL(RTRIM(LTRIM(@Code)),''''))+''')				
						  SET @ErrorMsg += ''Code already exists.'';
				 
                  
					  IF EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Category] with(Nolock) WHERE ISNULL(categoryname,'''') = '''+convert(NVARCHAR(255),ISNULL(RTRIM(LTRIM(@categoryname)),''''))+''' )
						  SET @ErrorMsg += ''Category Name already exists.'';
                  
					  IF LEN(@ErrorMsg) > 0
					  BEGIN
						  SELECT 
							   0 AS stat 
							  ,@ErrorMsg AS stat_msg
							  ,1001 AS stat_code;
						  RETURN;
					  END
                  
					  INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Category] 
							(
							   Code
							  ,categoryname
							  ,Descr
							  ,DisplayOrder
							  ,CreatedDate
							)

					  VALUES(
							   '''+convert(nvarchar(255),isnull(RTRIM(LTRIM(@Code)),''''))+'''
							  ,'''+convert(nvarchar(255),isnull(RTRIM(LTRIM(@categoryname)),''''))+'''
							  ,''' + convert(nvarchar(max), isnull(@Descr, '''')) + '''
							  ,  '+convert(nvarchar(255),isnull(@DisplayOrder,0))+' 
							  , ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							)
                  
					  SELECT 
							1 AS stat
						   ,''Category inserted successfully.'' AS stat_msg
						   ,1000 AS stat_code;'
		  PRINT(@SQL)
		  EXEC(@SQL)
	END
	ELSE IF(ISNULL(@mode,'')='ADDRATING')
	BEGIN
			SET @SQL ='
					IF EXISTS (
							SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_Tickets] 
							WHERE TicketNo = ''' + convert(nvarchar(255), @TicketNo) + '''
					)
					BEGIN
							INSERT INTO [' + @DBNAME + '].[dbo].[CallLog_Ticket_Rating] 
							( 
								TicketNo, RatingValue, RatingDescription, 
								RatingBy, EntryDate

							 ) VALUES(
								''' + convert(nvarchar(255), @TicketNo) + '''
								,' + convert(nvarchar(255), isnull(@RatingValue, 0)) + '
								,''' + convert(nvarchar(MAX), @RatingDescription) + '''
								,''' + convert(nvarchar(255), @RatingBy) + '''
								,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							 )

							SELECT 
							1 AS stat 
							,''Record save successfully.'' AS stat_msg 
							,1000 AS stat_code;
					END
					ELSE
					BEGIN
						SELECT
								0 as stat
								,''Ticket not found'' as stat_msg
								,1001 as stat_code
					END
			';
		  PRINT(@SQL)
		  EXEC(@SQL)
	END
	ELSE IF(ISNULL(@mode, '')='dashboard_data')
	BEGIN
			SET @SQL = '
				;WITH CombinedData AS (
					SELECT
						''CALL'' AS Type,
						cl.CallLogId as Id,
						u.customercode AS ProjectCode,
						cl.CustomerName AS CustomerName,
						NULL AS CreatedBy,
						cl.Descr AS Descr,
						NULL AS Subject,
						NULL AS TicketNo,
						cl.CreatedDate AS DateTime
					FROM [' + @DBNAME + '].[dbo].[CallLog] AS cl WITH(NOLOCK)
					LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
					  ON cl.ProjectID = u.id
					WHERE cl.IsActive = 1
					AND ISNULL(cl.CreatedBy, 0) = 0

					UNION ALL

					 SELECT
						''TICKET'' AS Type,
						ct.TicketId AS Id,
						ct.ProjectCode AS ProjectCode,
						ct.CustName AS CustomerName,
						CASE
							WHEN ISNULL(ct.CreatedBy, 0) = 0 THEN ''''
							ELSE LTRIM(RTRIM(
								ISNULL(us2.firstname, '''') + '' '' +
								CASE WHEN ISNULL(us2.middlename, '''') <> '''' THEN us2.middlename + '' '' ELSE '''' END +
								ISNULL(us2.lastname, '''')
							))
						END AS CreatedBy,
						ct.Descr,
						ct.Subject,
						ct.TicketNo,
						ct.CreatedDate AS DateTime
					FROM [' + @DBNAME + '].[dbo].[CallLog_Tickets] ct WITH(NOLOCK)
					LEFT JOIN [' + @DBNAME + '].[dbo].[usermanagement_systemloginmaster] us2 WITH(NOLOCK)
						ON us2.id = ct.CreatedBy
					OUTER APPLY (
						SELECT TOP 1
							ctc.Comments,
							ctc.CreatedDate
						FROM [' + @DBNAME + '].[dbo].[CallLog_Ticket_comments] ctc WITH(NOLOCK)
						WHERE ctc.TicketNo = ct.TicketNo
							AND ISNULL(ctc.CorpId, 0) <> 0
						ORDER BY ctc.CreatedDate DESC
					) lastCmt
					WHERE
						(
							ct.ModifiedDate IS NULL
							OR ct.statusId IS NULL
						)
						AND ISNULL(ct.statusId, 0) <> 37
				)

				SELECT *
				FROM CombinedData
				ORDER BY DateTime DESC;
			';
			PRINT(@SQL)

			SET @SQL1 = '
				WITH CallCounts AS (
					SELECT 
						EmployeeId,
						COUNT(*) AS TotalCallRecords,
						MAX(LastCallDate) AS LastCallDate,
						MAX(CallStatus) AS CallStatus
					FROM (
						SELECT 
							cl.CreatedBy AS EmployeeId,
							cl.CreatedDate AS LastCallDate,
							CASE
								WHEN ISNULL(cl.StartDate, '''') <> ''''
									 AND ISNULL(cl.EndDate, '''') = ''''
									THEN 1
								ELSE 0
							END AS CallStatus
						FROM ['+@DBNAME+'].[dbo].[CallLog] AS cl WITH(NOLOCK)
						WHERE  ISNULL(cl.CreatedBy, 0) <> 0
						AND (
							ISNULL(cl.ExternalStatusID, 44) = 44
							OR (
								ISNULL(cl.ExternalStatusID, 44) <> 47
								AND ISNULL(cl.InternalStatusID, 44) = 44
							) 
							OR (
								ISNULL(cl.StartDate, '''') <> ''''
								AND ISNULL(cl.EndDate, '''') = ''''
							)
							
						)

						UNION ALL

						SELECT 
							fu.ReceivedBy AS EmployeeId,
							null AS LastCallDate,
							0 AS CallStatus
						FROM [' + @DBNAME + '].[dbo].[CallLog_Follow_Up] AS fu WITH(NOLOCK)
						WHERE ISNULL(fu.IsForwardFollowup, 0) = 0
						AND ISNULL(fu.ReceivedBy, 0) <> 0
						AND ISNULL(fu.InternalStatus, 44) = 44
					) AS CombinedCallData
					GROUP BY EmployeeId
				),
				TicketCounts AS (
					SELECT 
						tk.EmployeeId AS EmployeeId,
						COUNT(*) AS TotalTicketRecords,
						MAX(t.CreatedDate) AS LastTicketDate
					FROM [' + @DBNAME + '].[dbo].[CallLog_Tickets] t WITH(NOLOCK)
					INNER JOIN [' + @DBNAME + '].[dbo].[CallLog_Tickets_Keyword] tk WITH (NOLOCK)
						ON tk.TicketId = t.TicketId
					OUTER APPLY (
						SELECT TOP 1
							ctc.Comments,
							ctc.CreatedDate,
							ctc.CorpId
						FROM [' + @DBNAME + '].[dbo].[CallLog_Ticket_comments] ctc WITH(NOLOCK)
						WHERE 
							ctc.TicketNo = t.TicketNo
							AND ISNULL(ctc.CorpId, 0) <> 0
							AND ISNULL(t.statusId, 0) <> 37
						ORDER BY 
							ctc.CreatedDate DESC,
							ctc.CommentId DESC
					) lastCmt
					WHERE ISNULL(t.statusId, 28) = 28
					OR ISNULL(lastCmt.CorpId, 0) <> 0
					GROUP BY tk.EmployeeId
				)
				SELECT 
					us.id AS CreatedBy,
					LTRIM(RTRIM(CONCAT(
						us.firstname, '' '',
						CASE 
							WHEN ISNULL(us.middlename, '''') <> ''''
							THEN us.middlename + '' ''
							ELSE ''''
						END,
						us.lastname
					))) AS EmpName,
					ISNULL(cc.TotalCallRecords, 0) AS TotalCallRecords,
					ISNULL(tc.TotalTicketRecords, 0) AS TotalTicketRecords,
					ISNULL(cc.CallStatus, 0) AS CallStatus,
					cc.LastCallDate,
					tc.LastTicketDate
				FROM [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] AS us WITH(NOLOCK)
				LEFT JOIN CallCounts cc ON us.id = cc.EmployeeId
				LEFT JOIN TicketCounts tc ON us.id = tc.EmployeeId
				WHERE ISNULL(IsLogin, 0) = 1
					AND ISNULL(IsActive, 0) = 1
					AND (
						ISNULL(cc.TotalCallRecords, 0) > 0 
						OR ISNULL(tc.TotalTicketRecords, 0) > 0
					)
				ORDER BY TotalCallRecords DESC, TotalTicketRecords DESC;
			';
			PRINT(@SQL1)
			EXEC(@SQL+@SQL1)
	END
	ELSE IF(isnull(@mode,'')='noti_list')
	BEGIN
		SET @SQL = '
			  SELECT
				cn.Id,
				cn.Title,
				cn.Message,
				cn.Module,
				ISNULL(cnu.IsRead, 0) AS IsRead,
				cn.EntryDate
			  FROM ['+@DBNAME+'].[dbo].[CSystem_Notification] cn WITH(NOLOCK)
			  LEFT JOIN ['+@DBNAME+'].[dbo].[CSystem_Notification_Users] cnu WITH(NOLOCK)
				ON cnu.NotificationId = cn.Id
			  WHERE CompanyCode = ''' + convert(nvarchar(255),@Projectcode) + '''
			  AND NOT EXISTS (
              SELECT 1
              FROM [' + @DBNAME + '].[dbo].[CSystem_Notification_Users] cd WITH (NOLOCK)
              WHERE cd.NotificationId = cn.Id
                AND cd.IsDelete = 1
                )
			  ORDER BY cn.Id DESC
				OFFSET ((' + LTRIM(RTRIM(STR(@Page))) + ' - 1) * ' + LTRIM(RTRIM(STR(@PageSize))) + ') ROWS
				FETCH NEXT ' + LTRIM(RTRIM(STR(@PageSize))) + ' ROWS ONLY
			
		   SELECT
			COUNT(*) AS TotalCount,
			COUNT(CASE WHEN ISNULL(cnu.IsRead, 0) = 1 THEN 1 END) AS ReadCount,
			COUNT(CASE WHEN ISNULL(cnu.IsRead, 0) = 0 THEN 1 END) AS UnreadCount
		   FROM [' + @DBNAME + '].[dbo].[CSystem_Notification] cn WITH (NOLOCK)
		   LEFT JOIN [' + @DBNAME + '].[dbo].[CSystem_Notification_Users] cnu WITH (NOLOCK)
		     ON cnu.NotificationId = cn.Id
		WHERE CompanyCode = ''' + convert(nvarchar(255),@Projectcode) + '''
		 AND NOT EXISTS (
              SELECT 1
              FROM [' + @DBNAME + '].[dbo].[CSystem_Notification_Users] cd WITH (NOLOCK)
              WHERE cd.NotificationId = cn.Id
                AND cd.IsDelete = 1
          );
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF(isnull(@mode,'')='noti_read')
	BEGIN
		SET @SQL = '
			  INSERT INTO ['+@DBNAME+'].[dbo].[CSystem_Notification_Users] (
				NotificationId, UserId, IsRead, ReadDate
			  ) VALUES (
					' + convert(nvarchar(255), @NotificationId) + ',
					' + convert(nvarchar(255), @CorpId) + ',
					1,
					ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
			  )

			  SELECT 
				1 AS stat 
				,''Record save successfully.'' AS stat_msg 
				,1000 AS stat_code;
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode, '') = 'noti_delete')
    BEGIN
    SET @SQL = '
        IF EXISTS (
            SELECT 1
            FROM [' + @DBNAME + '].[dbo].[CSystem_Notification_Users]
            WHERE NotificationId = ' + CONVERT(NVARCHAR(20), @NotificationId) + '
              AND UserId = ' + CONVERT(NVARCHAR(20), @CorpId) + '
        )
        BEGIN
            UPDATE [' + @DBNAME + '].[dbo].[CSystem_Notification_Users]
            SET
                IsDelete = 1,
                DeleteDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
            WHERE NotificationId = ' + CONVERT(NVARCHAR(20), @NotificationId) + '
              AND UserId = ' + CONVERT(NVARCHAR(20), @CorpId) + ';
        END
        ELSE
        BEGIN
            INSERT INTO [' + @DBNAME + '].[dbo].[CSystem_Notification_Users]
            (
                NotificationId, UserId, IsRead, IsDelete, DeleteDate
            )
            VALUES
            (
                ' + CONVERT(NVARCHAR(20), @NotificationId) + ',
                ' + CONVERT(NVARCHAR(20), @CorpId) + ',
                0,
                1,
                ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
            );
        END;

        SELECT
            1 AS stat,
            ''Notification deleted successfully.'' AS stat_msg,
            1000 AS stat_code;
    ';

    PRINT(@SQL);
    EXEC(@SQL);
  END
	ELSE IF(isnull(@mode,'')='login')
	BEGIN
		print @mode


		DECLARE 
			 @apiurl AS NVARCHAR(MAX)=''
			,@UploadLogicalPath	AS NVARCHAR(MAX)=''		
			,@ImageLogicalPath	AS NVARCHAR(MAX)=''			
			,@jojsPath	AS NVARCHAR(MAX)=''	
			,@SMSView_URL AS NVARCHAR(MAX)=''

		SELECT TOP(1)
			 @apiurl=apiurl	
			,@UploadLogicalPath=UploadLogicalPath
			,@ImageLogicalPath=ImageLogicalPath
			,@jojsPath=jojsPath	
			,@SMSView_URL=SMSView_URL 
		FROM [404146_CentralUser].dbo.inf WITH (NOLOCK)


	

		IF(@appuserid<>'' and @psw<>'' and @companycode<>'')
		BEGIN
			DECLARE 
				 @_DBNAME AS NVARCHAR(100)=''
				,@_dbUniqueKey AS NVARCHAR(100)=''
				,@_ukey AS NVARCHAR(200)=''
				,@_svid AS INT=0
				,@_yearcode AS NVARCHAR(max)=''
				,@_cuver AS NVARCHAR(50)=''

				SELECT 
					 @_DBNAME=dbname
					,@_dbUniqueKey=dbUniqueKey
					,@_ukey=ukey
					,@_svid=serverid
					,@_cuver=cuVer
					,@_yearcode=[dbo].[Base64Encode](concat('{{',domainname,'}}{{',yearname,'}}{{',companycode,'}}{{',company_password,'}}'))
				from [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission with (nolock)
				where ISNULL(UFCC,'')=@companycode

			SET @SQL='
					declare 
						@_id as int=0
						,@_customercode as nvarchar(100)=''''
						,@_firstname as nvarchar(200)=''''
						,@_middlename as nvarchar(200)=''''
						,@_lastname as nvarchar(200)=''''
						,@_designation as nvarchar(200)=''''	
						,@_mobileno as nvarchar(200)=''''
						,@_email1 as nvarchar(200)=''''
						,@_userid as nvarchar(200)=''''

					select TOP(1)
						@_id=id 
						,@_customercode=ISNULL(customercode,'''')
						,@_firstname=firstname
						,@_middlename=middlename
						,@_lastname=lastname
						,@_designation=designation	
						,@_mobileno=mobileno
						,@_email1=email1
						,@_userid=userid
					from ['+@_DBNAME+'].DBO.usermanagement_systemloginmaster WITH (NOLOCK)
					where ISNULL(userid,'''')='''+@appuserid+'''
					and ISNULL(password,'''')='''+@psw+'''				
					and isnull(mastermanagement_roleid,0)=3

				IF(@_id>0)
				BEGIN
					SELECT 
						1 as stat
						,''login successfully'' as stat_msg
						,1000 as stat_code
						,@_id as id 
						,@_customercode as customercode
						,@_firstname as firstname
						,@_middlename as middlename
						,@_lastname as lastname
						,@_designation as designation	
						,@_mobileno as mobileno
						,@_email1 as email1
						,@_userid as userid
						,'''+@_dbUniqueKey+'''  as token
						,'''+@_ukey+'''  as ukey		
						,'''+@companycode+''' as companycode
						,'''+@apiurl+''' as apiurl
						,'''+REPLACE(@UploadLogicalPath,'{{vername}}',@_cuver)+''' as UploadLogicalPath		
						,'''+REPLACE(@ImageLogicalPath,'{{vername}}',@_cuver)+''' as ImageLogicalPath			
						,'''+@jojsPath+''' as jojsPath
						,'''+@SMSView_URL+''' as SMSView_URL
						,'''+convert(nvarchar(200),@_svid)+''' as svid
						,'''+@_yearcode+''' as yearcode
						,'''+@_cuver+''' as cuver
					select 
						id
						,title as pagename 
					from ['+@_DBNAME+'].DBO.usermanagement_role_pages WITH (NOLOCK)
					where id in (
						select 
							ISNULL([usermanagement_role_pagesid],0)
						from ['+@_DBNAME+'].DBO.[UserManagement_UserRightsBinding] WITH (NOLOCK)
						where Usermanagement_systemloginmasterid=@_id
						and appsname=''TASKMGT''
					)
				END
				ELSE
				BEGIN
					SELECT 
						0 as stat
						,''invalid companycode or userid or password'' as stat_msg
						,1001 as stat_code;
				END	
			'
			PRINT (@SQL)
			EXEC (@SQL)
		END
	END
	ELSE IF(ISNULL(@mode,'')='SAVE_HELPVIDEO_FEEDBACK')
	BEGIN
		SET @SQL = '
			INSERT INTO ['+@DBNAME+'].[dbo].[HelpVideoUserFeedback]
			(
				UserId,
				UserName,
				VideoName,
				VideoLang,
				SectionName,
				Feedback,
				Comment,
				CreatedDate
			)
			VALUES
			(
				NULLIF(' + CONVERT(NVARCHAR(30), ISNULL(@UserId, 0)) + ', 0),
				NULLIF(''' + @UserName + ''', ''''),
				NULLIF(''' + @VideoName + ''', ''''),
				NULLIF(' + CONVERT(NVARCHAR(10), ISNULL(@VideoLang, 0)) + ', 0),
				NULLIF(''' + @SectionName + ''', ''''),
				' + CONVERT(NVARCHAR(10), ISNULL(@Feedback, 0)) + ',
				NULLIF(''' + @Comment + ''', ''''),
				ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
			);

			SELECT 
				1 AS stat,
				''Feedback saved successfully'' AS stat_msg,
				1000 AS stat_code,
				SCOPE_IDENTITY() AS Id;
		';

		PRINT(@SQL);
		EXEC(@SQL);
	END
	ELSE IF(ISNULL(@mode,'')='GET_HELPVIDEO_FEEDBACK')
	BEGIN
		SET @SQL = '
			SELECT 
				Id,
				UserId,
				UserName,
				VideoName,
				VideoLang,
				SectionName,
				Feedback,
				Comment,
				ISNULL(CONVERT(VARCHAR(19), CreatedDate, 120), '''') AS CreatedDate
			FROM ['+@DBNAME+'].[dbo].[HelpVideoUserFeedback] WITH (NOLOCK)
			WHERE 1 = 1
			' + CASE WHEN ISNULL(@VideoName, '') <> '' THEN ' AND VideoName = ''' + @VideoName + '''' ELSE '' END + '
			' + CASE WHEN ISNULL(@SectionName, '') <> '' THEN ' AND SectionName = ''' + @SectionName + '''' ELSE '' END + '
			' + CASE WHEN ISNULL(@VideoLang, 0) <> 0 THEN ' AND VideoLang = ' + CONVERT(NVARCHAR(10), @VideoLang) ELSE '' END + '
			' + CASE WHEN ISNULL(@UserId, 0) <> 0 THEN ' AND UserId = ' + CONVERT(NVARCHAR(30), @UserId) ELSE '' END + '
			ORDER BY Id DESC;
		';

		PRINT(@SQL);
		EXEC(@SQL);
	END
Execute [GetTxLog] @spname,@FROMDate,@DBNAME,@appuserid,@IPAddress,@FormName,'CallLog_Ticketv4',@mode
END TRY
BEGIN CATCH	     
	
	SELECT 
		0 as stat
		,'"Contact your Admin"' as stat_msg
		,1001 as stat_code
		,'null' as device_token
	
	EXECUTE [GetErrlog] @appuserid,@FROMDate,@DBNAME,@spname,@IPAddress,@FormName,'CallLog_Ticketv4',@mode;
END CATCH;
END